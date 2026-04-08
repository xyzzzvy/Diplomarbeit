import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import chess
import math
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List

# ---------------------------
# 1. HELPER & MODEL (Basis)
# ---------------------------
PROMO_MAP = {None: 0, chess.KNIGHT: 1, chess.BISHOP: 2, chess.ROOK: 3, chess.QUEEN: 4}
REV_PROMO = {v: k for k, v in PROMO_MAP.items()}
ACTION_SIZE = 64 * 64 * 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"


def move_to_index(move):
    return ((move.from_square * 64) + move.to_square) * 5 + PROMO_MAP.get(move.promotion, 0)


def index_to_move(idx):
    base, promo_idx = divmod(idx, 5)
    f, t = divmod(base, 64)
    return f, t, REV_PROMO.get(promo_idx, None)


def board_to_planes(board):
    planes = []
    for color in [chess.WHITE, chess.BLACK]:
        for pt in [chess.PAWN, chess.KNIGHT, chess.BISHOP, chess.ROOK, chess.QUEEN, chess.KING]:
            bb = board.pieces(pt, color)
            plane = np.zeros((8, 8), dtype=np.float32)
            for sq in chess.SquareSet(bb): plane[7 - chess.square_rank(sq), chess.square_file(sq)] = 1.0
            planes.append(plane)
    planes.append(np.full((8, 8), 1.0 if board.turn == chess.WHITE else 0.0, dtype=np.float32))
    planes.append(np.full((8, 8), min(board.halfmove_clock, 100) / 100.0, dtype=np.float32))
    while len(planes) < 19: planes.append(np.zeros((8, 8), dtype=np.float32))
    return np.stack(planes[:19], axis=0)


class ResBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(channels)
        self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(channels)

    def forward(self, x): return F.relu(self.bn2(self.conv2(F.relu(self.bn1(self.conv1(x))))) + x)


class AlphaZeroNet(nn.Module):
    def __init__(self, filters=256, blocks=20):
        super().__init__()
        self.stem = nn.Sequential(nn.Conv2d(19, filters, 3, padding=1, bias=False), nn.BatchNorm2d(filters), nn.ReLU())
        self.blocks = nn.Sequential(*[ResBlock(filters) for _ in range(blocks)])
        self.policy_head = nn.Sequential(nn.Conv2d(filters, 32, 1), nn.BatchNorm2d(32), nn.ReLU(), nn.Flatten(),
                                         nn.Linear(32 * 64, ACTION_SIZE))
        self.value_head = nn.Sequential(nn.Conv2d(filters, 1, 1), nn.BatchNorm2d(1), nn.ReLU(), nn.Flatten(),
                                        nn.Linear(64, 256), nn.ReLU(), nn.Linear(256, 1), nn.Tanh())

    def forward(self, x):
        x = self.blocks(self.stem(x))
        return self.policy_head(x), self.value_head(x).squeeze(-1)


# ---------------------------
# 2. MCTS LOGIK (Für Inference)
# ---------------------------
class Node:
    def __init__(self, prior, to_play):
        self.prior = prior
        self.to_play = to_play
        self.N = 0
        self.W = 0.0
        self.Q = 0.0
        self.children = {}


class MCTS:
    def __init__(self, model, device='cuda'):
        self.model = model
        self.device = device
        self.cpuct = 1.5

    def run(self, board, simulations=400):
        # Root Node erstellen
        root = Node(0, board.turn)

        # Initial Expansion (Wurzel)
        self._expand_node(root, board)

        # Simulationen
        for _ in range(simulations):
            node = root
            scratch = board.copy(stack=False)
            path = [node]

            # 1. SELECTION (Wandere durch den Baum)
            while node.children:
                best_s = -float('inf')
                best_a = -1
                sqrtN = math.sqrt(max(1, node.N))

                for a, child in node.children.items():
                    # UCB Formel
                    score = child.Q + self.cpuct * child.prior * sqrtN / (1 + child.N)
                    if score > best_s:
                        best_s = score
                        best_a = a

                if best_a == -1: break  # Sollte nicht passieren

                f, t, p = index_to_move(best_a)
                move = chess.Move(f, t, p)
                scratch.push(move)
                node = node.children[best_a]
                path.append(node)

            # 2. EVALUATION & EXPANSION (Neuer Knoten)
            value = 0.0
            if scratch.is_game_over():
                res = scratch.outcome()
                if res.winner is None:
                    value = 0.0
                else:
                    value = 1.0 if res.winner == scratch.turn else -1.0
            else:
                # Hier fragen wir das Model
                value = self._expand_node(node, scratch)

            # 3. BACKPROPAGATION (Ergebnis zurückmelden)
            # Value ist aus Sicht des Spielers, der gezogen hat.
            # Im Pfad wechseln sich die Spieler ab, also muss Value jedes Mal negiert werden.
            for n in reversed(path):
                n.N += 1
                n.W += value
                n.Q = n.W / n.N
                value = -value

        return root

    def _expand_node(self, node, board):
        """Fragt das Neural Net ab und erstellt Kinder-Knoten."""
        inp = board_to_planes(board)
        tensor = torch.from_numpy(inp).unsqueeze(0).to(self.device)

        with torch.no_grad():
            pi_logits, v = self.model(tensor)

        # Softmax für Wahrscheinlichkeiten
        probs = F.softmax(pi_logits, dim=1).cpu().numpy()[0]
        value = v.item()

        # Nur legale Züge als Kinder anlegen
        legal_moves = list(board.legal_moves)
        valid_indices = []
        for move in legal_moves:
            idx = move_to_index(move)
            valid_indices.append(idx)
            # Neuer Knoten für den Zug
            node.children[idx] = Node(probs[idx], not node.to_play)

        return value


## ---------------------------
# 3. FASTAPI SERVER (Mit Lifespan)
# ---------------------------
from contextlib import asynccontextmanager

# Globales Model
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- STARTUP LOGIK ---
    global model
    try:
        print(f"🔄 Lade Model auf {DEVICE}...")
        # Model initialisieren
        loaded_model = AlphaZeroNet(filters=256, blocks=20).to(DEVICE)

        # Gewichte laden
        if torch.cuda.is_available():
            state = torch.load("best_model.pt", map_location=DEVICE)
        else:
            state = torch.load("best_model.pt", map_location=torch.device('cpu'))

        clean_state = {k.replace("_orig_mod.", ""): v for k, v in state.items()}
        loaded_model.load_state_dict(clean_state)
        loaded_model.eval()

        model = loaded_model
        print("✅ Model & MCTS bereit!")
    except Exception as e:
        print(f"❌ Fehler beim Laden: {e}")

    yield  # Hier läuft die App...

    # --- SHUTDOWN LOGIK (optional) ---
    print("🛑 Server wird beendet. Speicher wird freigegeben.")
    model = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

# App mit Lifespan initialisieren
app = FastAPI(title="AlphaZero MCTS API", lifespan=lifespan)

class FenRequest(BaseModel):
    fen: str
    simulations: int = 400

@app.post("/predict")
def predict(req: FenRequest):
    if model is None:
        raise HTTPException(500, "Model not loaded")

    try:
        board = chess.Board(req.fen)
    except:
        raise HTTPException(400, "Invalid FEN")

    if board.is_game_over():
        return {"game_over": True}

    # 🔥 MCTS STARTEN
    mcts = MCTS(model, DEVICE)
    root = mcts.run(board, simulations=req.simulations)

    best_action = -1
    max_N = -1
    move_stats = []

    for a, child in root.children.items():
        if child.N > max_N:
            max_N = child.N
            best_action = a

        if child.N > 10:
            f, t, p = index_to_move(a)
            m_uci = chess.Move(f, t, p).uci()
            move_stats.append({"move": m_uci, "visits": child.N, "score": float(child.Q)})

    if best_action == -1:
        return {"error": "No moves found"}

    f, t, p = index_to_move(best_action)
    best_move = chess.Move(f, t, p)

    move_stats.sort(key=lambda x: x["visits"], reverse=True)

    return {
        "best_move": best_move.uci(),
        "visits": max_N,
        "evaluation": float(root.Q),
        "top_moves": move_stats[:5]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)