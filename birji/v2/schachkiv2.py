#!/usr/bin/env python3
"""
AlphaZero-Pro — RTX 4080 'GOD MODE' (Stable Windows Edition)
- Hardware: Optimized for i7-13700KF + RTX 4080 + 64GB RAM
- Feature: Smart Sharding & Auto-Migration (Liest alte Buffer und konvertiert sie)
- Safety: Kein Datenverlust bei Crash, kein langes Warten beim Beenden.
"""
from __future__ import annotations
import os
import math
import random
import argparse
import time
import queue
import shutil
import pickle
import glob
from dataclasses import dataclass
from collections import deque
from typing import List, Tuple, Dict, Optional

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.multiprocessing as mp
import chess

# ---------------------------
# 💾 BUFFER MANAGER & MIGRATION
# ---------------------------
BUFFER_FOLDER = "replay_data"
SEGMENT_SIZE = 2000  # Speichert alle 2000 Positionen ein File (ca. 200 MB)
MAX_DISK_SEGMENTS = 250  # Behält die neuesten 250 Dateien (500k Positionen)


def save_segment(data_chunk):
    """Speichert einen Teil des Buffers als kleine Datei."""
    if not os.path.exists(BUFFER_FOLDER):
        os.makedirs(BUFFER_FOLDER)

    timestamp = int(time.time() * 1000)
    # Füge Zufallszahl hinzu, falls im selben Timestamp mehrere Chunks kommen (bei Migration)
    rand_id = random.randint(1000, 9999)
    filename = os.path.join(BUFFER_FOLDER, f"segment_{timestamp}_{rand_id}.pkl")

    try:
        with open(filename, "wb") as f:
            pickle.dump(data_chunk, f)
    except Exception as e:
        print(f"❌ Fehler beim Speichern des Segments: {e}")

    # Alte Segmente löschen (Rotation auf der Festplatte)
    files = sorted(glob.glob(os.path.join(BUFFER_FOLDER, "*.pkl")))
    while len(files) > MAX_DISK_SEGMENTS:
        oldest = files.pop(0)
        try:
            os.remove(oldest)
        except:
            pass


def load_segments(buffer):
    """Lädt neue Segmente UND migriert alte legacy Dateien falls vorhanden."""

    # 1. NEUE DATEN LADEN (aus dem Ordner)
    if os.path.exists(BUFFER_FOLDER):
        files = sorted(glob.glob(os.path.join(BUFFER_FOLDER, "*.pkl")))
        if files:
            print(f"📂 Lade {len(files)} Segmente aus '{BUFFER_FOLDER}'...")
            count = 0
            for f_path in files:
                try:
                    with open(f_path, "rb") as f:
                        data = pickle.load(f)
                        buffer.extend(data)
                        count += len(data)
                except Exception as e:
                    print(f"⚠️ Defektes Segment übersprungen: {f_path}")
            print(f"✅ {count} Positionen aus Segmenten geladen.")

    # 2. ALTE DATEI MIGRIEREN (Falls 'replay_buffer.pkl' existiert)
    if os.path.exists("replay_buffer.pkl"):
        print("\n⚠️ ALTE 'replay_buffer.pkl' GEFUNDEN! Starte Migration...")
        try:
            with open("replay_buffer.pkl", "rb") as f:
                old_data = pickle.load(f)

            # Falls old_data kein Listen-Objekt ist, konvertieren
            if not isinstance(old_data, list):
                old_data = list(old_data)

            print(f"📥 {len(old_data)} alte Positionen geladen. Konvertiere in Segmente...")

            # In RAM laden
            buffer.extend(old_data)

            # In kleine Häppchen schneiden und speichern
            chunk_size = SEGMENT_SIZE
            for i in range(0, len(old_data), chunk_size):
                chunk = old_data[i:i + chunk_size]
                save_segment(chunk)  # Speichert es im neuen Format

            print("✅ Migration abgeschlossen! Alle Daten sind jetzt im Ordner 'replay_data'.")

            # Alte Datei umbenennen (Backup), damit sie beim nächsten Start ignoriert wird
            os.rename("replay_buffer.pkl", "replay_buffer_MIGRATED.bak")
            print("♻️ Alte Datei wurde in 'replay_buffer_MIGRATED.bak' umbenannt.\n")

        except Exception as e:
            print(f"❌ Fehler bei der Migration: {e}")


# ---------------------------
# 📊 DASHBOARD
# ---------------------------
class ChessVisualizer:
    def __init__(self):
        import pygame
        self.pygame = pygame
        pygame.init()
        self.WIDTH, self.HEIGHT = 1000, 640
        self.BOARD_SIZE = 640
        self.SQUARE_SIZE = self.BOARD_SIZE // 8
        self.SCREEN = pygame.display.set_mode((self.WIDTH, self.HEIGHT))
        pygame.display.set_caption("AlphaZero GOD MODE 🧠")
        self.font = pygame.font.SysFont('Consolas', 16)
        self.large_font = pygame.font.SysFont('Arial', 32, bold=True)
        self.piece_map = {'P': 'P', 'N': 'N', 'B': 'B', 'R': 'R', 'Q': 'Q', 'K': 'K',
                          'p': 'p', 'n': 'n', 'b': 'b', 'r': 'r', 'q': 'q', 'k': 'k'}

    def draw(self, board, stats):
        self.SCREEN.fill((30, 30, 35))
        # Board
        for r in range(8):
            for c in range(8):
                color = (200, 200, 200) if (r + c) % 2 == 0 else (100, 120, 80)
                self.pygame.draw.rect(self.SCREEN, color,
                                      (c * self.SQUARE_SIZE, r * self.SQUARE_SIZE, self.SQUARE_SIZE, self.SQUARE_SIZE))

        # Pieces
        for sq in chess.SQUARES:
            p = board.piece_at(sq)
            if p:
                col, row = chess.square_file(sq), 7 - chess.square_rank(sq)
                x, y = col * self.SQUARE_SIZE + self.SQUARE_SIZE // 2, row * self.SQUARE_SIZE + self.SQUARE_SIZE // 2
                color = (0, 0, 0) if p.color == chess.BLACK else (255, 255, 255)
                outline = (255, 255, 255) if p.color == chess.BLACK else (0, 0, 0)
                self.pygame.draw.circle(self.SCREEN, outline, (x, y), 30)
                self.pygame.draw.circle(self.SCREEN, color, (x, y), 27)
                txt = self.large_font.render(self.piece_map[p.symbol()], True, outline)
                self.SCREEN.blit(txt, txt.get_rect(center=(x, y)))

        # Stats Panel
        x_off = 660;
        y_off = 20
        title = self.font.render("SYSTEM STATUS", True, (0, 255, 0))
        self.SCREEN.blit(title, (x_off, y_off));
        y_off += 40

        for k, v in stats.items():
            if "Prob" in k:  # Bar
                self.pygame.draw.rect(self.SCREEN, (60, 60, 60), (x_off, y_off, 300, 20))
                val_clamped = max(0.0, min(1.0, float(v)))
                self.pygame.draw.rect(self.SCREEN, (0, 200, 255), (x_off, y_off, int(300 * val_clamped), 20))
                lbl = self.font.render(f"{k}: {v:.2%}", True, (255, 255, 255))
            else:
                lbl = self.font.render(f"{k}: {v}", True, (220, 220, 220))
            self.SCREEN.blit(lbl, (x_off, y_off));
            y_off += 30
        self.pygame.display.flip()

    def loop(self):
        for e in self.pygame.event.get():
            if e.type == self.pygame.QUIT: return False
        return True


# ---------------------------
# MODEL & HELPERS
# ---------------------------
PROMO_MAP = {None: 0, chess.KNIGHT: 1, chess.BISHOP: 2, chess.ROOK: 3, chess.QUEEN: 4}
REV_PROMO = {v: k for k, v in PROMO_MAP.items()}
ACTION_SIZE = 64 * 64 * 5


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
# 🔥 GPU SERVER
# ---------------------------
def gpu_server_process(req_queue, resp_pipes, stop_event, args):
    device = torch.device(args.device)
    torch.set_float32_matmul_precision('high')
    torch.backends.cudnn.benchmark = True

    net = AlphaZeroNet(filters=args.filters, blocks=args.res_blocks).to(device)

    if os.name != 'nt':
        try:
            net = torch.compile(net)
            print("✅ GPU Server: Compiled with Triton!")
        except Exception:
            pass
    else:
        print("ℹ️  Windows detected: Skipped torch.compile")

    net.eval()
    if os.path.exists("best_model.pt"):
        try:
            state = torch.load("best_model.pt", map_location=device)
            new_state = {k.replace("_orig_mod.", ""): v for k, v in state.items()}
            net.load_state_dict(new_state)
            print("✅ GPU Server: Loaded best_model.pt")
        except Exception as e:
            print(f"⚠️ Failed to load model: {e}")

    print(f"🚀 GPU Server ACTIVE. Batch Size: {args.gpu_batch_size}")

    while not stop_event.is_set():
        batch_reqs = []
        try:
            req = req_queue.get(timeout=0.1)
            batch_reqs.append(req)
            while len(batch_reqs) < args.gpu_batch_size:
                try:
                    batch_reqs.append(req_queue.get_nowait())
                except queue.Empty:
                    break
        except queue.Empty:
            continue

        worker_ids, states = zip(*batch_reqs)
        state_tensor = torch.from_numpy(np.stack(states)).to(device, non_blocking=True)

        with torch.amp.autocast(device_type="cuda"):
            with torch.no_grad():
                pi, v = net(state_tensor)

        pis = F.softmax(pi, dim=1).cpu().numpy()
        vs = v.cpu().numpy()

        for i, w_id in enumerate(worker_ids):
            try:
                resp_pipes[w_id].send((pis[i], vs[i]))
            except (BrokenPipeError, ConnectionResetError):
                pass


# ---------------------------
# MCTS & WORKER
# ---------------------------
class RemoteMCTS:
    def __init__(self, worker_id, req_queue, resp_pipe):
        self.wid = worker_id;
        self.q = req_queue;
        self.pipe = resp_pipe;
        self.cpuct = 1.5

    def run(self, board, sims):
        root = Node(None, 1.0, board.turn)
        self.q.put((self.wid, board_to_planes(board)))
        prob, val = self.pipe.recv()
        self._expand(root, board, prob)

        for _ in range(sims):
            node = root
            scratch = board.copy(stack=False);
            path = [node]
            while node.children:
                best_s = -float('inf')
                best_a = -1
                sqrtN = math.sqrt(max(1, node.N))

                for a, c in node.children.items():
                    s = c.Q + self.cpuct * c.prior * sqrtN / (1 + c.N)
                    if s > best_s:
                        best_s = s
                        best_a = a

                if best_a == -1: break
                f, t, p = index_to_move(best_a)
                mv = chess.Move(f, t, p)
                if mv not in scratch.legal_moves: del node.children[best_a]; continue
                scratch.push(mv)
                node = node.children[best_a]
                path.append(node)

            if scratch.is_game_over():
                res = scratch.outcome()
                val = 0.0 if res.winner is None else (1.0 if res.winner == scratch.turn else -1.0)
            else:
                self.q.put((self.wid, board_to_planes(scratch)))
                prob, val = self.pipe.recv()
                self._expand(node, scratch, prob)

            for n in reversed(path): n.N += 1; n.W += val; n.Q = n.W / n.N; val = -val

        pi = np.zeros(ACTION_SIZE, dtype=np.float32)
        for a, c in root.children.items(): pi[a] = c.N

        sum_pi = pi.sum()
        if sum_pi > 0: pi /= sum_pi
        return pi, val

    def _expand(self, node, board, probs):
        node.children = {}
        valid = list(board.legal_moves)
        idxs = [move_to_index(m) for m in valid]
        for idx in idxs:
            node.children[idx] = Node(node, probs[idx], not node.to_play)


@dataclass
class Node:
    parent: Optional["Node"]
    prior: float
    to_play: bool
    N: int = 0
    W: float = 0.0
    Q: float = 0.0
    children: Optional[Dict] = None


@dataclass
class Sample:
    state: np.ndarray
    pi: np.ndarray
    z: float


def worker_process(wid, req_q, resp_pipe, result_q, args):
    try:
        mcts = RemoteMCTS(wid, req_q, resp_pipe)
        np.random.seed(args.seed + wid)
        random.seed(args.seed + wid)

        while True:
            board = chess.Board()
            data = []
            moves = 0
            # Limit auf 250 für schnellere Iterationen
            while not board.is_game_over(claim_draw=True) and moves < 250:
                pi, val = mcts.run(board, sims=args.mcts_sims)
                if wid == 0: result_q.put(("STATS", (board.fen(), val, moves)))

                legal = [move_to_index(m) for m in board.legal_moves]
                mask = np.zeros_like(pi)
                for i in legal: mask[i] = pi[i]

                mask_sum = mask.sum()
                if mask_sum > 1e-8:
                    mask /= mask_sum
                else:
                    mask[legal] = 1.0 / len(legal)

                try:
                    idx = np.random.choice(len(mask), p=mask) if moves < 30 else np.argmax(mask)
                except ValueError:
                    mask = mask / mask.sum()
                    idx = np.random.choice(len(mask), p=mask)

                data.append((board_to_planes(board), mask, 1 if board.turn == chess.WHITE else -1))
                f, t, p = index_to_move(idx)
                board.push(chess.Move(f, t, p))
                moves += 1

            res = board.outcome(claim_draw=True)
            z = 1.0 if res and res.winner == chess.WHITE else (-1.0 if res and res.winner == chess.BLACK else 0.0)
            result_q.put(("DATA", [Sample(s, p, z * pl) for s, p, pl in data]))
    except KeyboardInterrupt:
        return


# ---------------------------
# MAIN
# ---------------------------
def main():
    parser = argparse.ArgumentParser(description="AlphaZero RTX 4080 Tuner")
    # i7-13700KF: 24 Threads. -2 für System/GPU ist optimal.
    parser.add_argument('--workers', type=int, default=os.cpu_count() - 2)
    parser.add_argument('--gpu_batch_size', type=int, default=128)
    parser.add_argument('--filters', type=int, default=256)
    parser.add_argument('--res_blocks', type=int, default=20)
    parser.add_argument('--train_batch_size', type=int, default=2048)
    parser.add_argument('--lr', type=float, default=0.001)
    parser.add_argument('--mcts_sims', type=int, default=50)
    parser.add_argument('--device', type=str, default='cuda')
    parser.add_argument('--seed', type=int, default=42)
    args = parser.parse_args()

    mp.set_start_method('spawn', force=True)
    req_queue = mp.Queue()
    result_queue = mp.Queue()
    resp_pipes = {}
    worker_pipes = {}
    stop_event = mp.Event()

    print(f"🔥 ENGINE START | W:{args.workers} | M:{args.filters}f/{args.res_blocks}b | Sims:{args.mcts_sims}")

    for i in range(args.workers):
        p_conn, c_conn = mp.Pipe()
        resp_pipes[i] = p_conn
        worker_pipes[i] = c_conn

    # Create processes
    gpu_proc = mp.Process(target=gpu_server_process, args=(req_queue, resp_pipes, stop_event, args))
    gpu_proc.daemon = True
    gpu_proc.start()

    workers = []
    for i in range(args.workers):
        w = mp.Process(target=worker_process, args=(i, req_queue, worker_pipes[i], result_queue, args))
        w.daemon = True
        workers.append(w)
        w.start()

    vis = ChessVisualizer()

    # --- 64 GB RAM MODE (Smart Sharding) ---
    buffer = deque(maxlen=500000)
    pending_storage = []  # Zwischenspeicher für Disk-Schreiben

    # 1. ALTE SEGMENTE ODER LEGACY BUFFER LADEN
    load_segments(buffer)
    # -----------------------------------------

    train_net = AlphaZeroNet(filters=args.filters, blocks=args.res_blocks).to(args.device)

    if os.path.exists("best_model.pt"):
        try:
            train_net.load_state_dict(torch.load("best_model.pt", map_location=args.device))
        except:
            pass

    opt = torch.optim.Adam(train_net.parameters(), lr=args.lr, weight_decay=1e-4)
    scaler = torch.amp.GradScaler('cuda')

    step = 0;
    games = 0;
    fen = chess.STARTING_FEN;
    val = 0.0;
    mv = 0
    loss_val = 0.0

    try:
        while True:
            if not vis.loop(): break

            vis.draw(chess.Board(fen), {
                "Games": games, "Buffer": len(buffer), "Steps": step,
                "Win Prob": (val + 1) / 2, "Move": mv, "Loss": f"{loss_val:.4f}"
            })

            while not result_queue.empty():
                try:
                    t, p = result_queue.get_nowait()
                    if t == "DATA":
                        # A) In den RAM für Training
                        buffer.extend(p)

                        # B) In den Zwischenspeicher für die Disk
                        pending_storage.extend(p)

                        # C) Prüfen ob Segment voll ist (Mini-Save)
                        if len(pending_storage) >= SEGMENT_SIZE:
                            save_segment(pending_storage)
                            pending_storage = []  # Reset

                        games += 1
                    elif t == "STATS":
                        fen, val, mv = p
                except queue.Empty:
                    break

            if len(buffer) > args.train_batch_size:
                train_net.train()
                for _ in range(1):  # 2 updates per frame
                    batch = random.sample(buffer, args.train_batch_size)
                    s = torch.from_numpy(np.stack([x.state for x in batch])).to(args.device)
                    pi = torch.from_numpy(np.stack([x.pi for x in batch])).to(args.device)
                    z = torch.tensor([x.z for x in batch], dtype=torch.float32).to(args.device)

                    opt.zero_grad()
                    with torch.amp.autocast(device_type="cuda"):
                        p_pred, v_pred = train_net(s)
                        loss = -(pi * F.log_softmax(p_pred, dim=1)).sum(dim=1).mean() + F.mse_loss(v_pred, z)

                    scaler.scale(loss).backward();
                    scaler.step(opt);
                    scaler.update()
                    loss_val = loss.item()

                step += 1
                if step % 50 == 0:
                    print(f"Train Step {step} | Loss: {loss_val:.4f}")
                    torch.save(train_net.state_dict(), "temp_model.pt")
                    shutil.move("temp_model.pt", "best_model.pt")

    except KeyboardInterrupt:
        print("\n🛑 Stop Signal (Ctrl+C) empfangen...")

    except Exception as e:
        print(f"\n⚠️ Ein Fehler ist aufgetreten: {e}")

    finally:
        print("\n💾 Shutdown Routine...")

        # 1. Letztes unvollständiges Segment speichern
        if len(pending_storage) > 0:
            print(f"💾 Speichere restliche {len(pending_storage)} Positionen...")
            save_segment(pending_storage)
            print("✅ Rest-Daten gesichert.")

        # 2. Model speichern
        try:
            torch.save(train_net.state_dict(), "final_model.pt")
            print("✅ Model 'final_model.pt' gesichert.")
        except Exception as e:
            print(f"❌ Fehler beim Model-Speichern: {e}")

        # 3. Aufräumen
        stop_event.set()
        gpu_proc.join(timeout=2)
        for p in workers:
            p.terminate()
            p.join(timeout=1)
        print("👋 Engine Shutdown Complete.")


if __name__ == "__main__":
    main()