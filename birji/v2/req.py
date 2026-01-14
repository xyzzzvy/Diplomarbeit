import requests
import chess

API_URL = "http://localhost:8000/predict"


def test_fen(name, fen, sims=800):
    print(f"\n--- {name} ---")
    print(f"FEN: {fen}")

    payload = {"fen": fen, "simulations": sims}
    try:
        resp = requests.post(API_URL, json=payload).json()

        if "error" in resp:
            print(f"❌ Fehler: {resp['error']}")
            return

        print(f"👉 Bester Zug: {resp['best_move']}")
        print(f"📊 Bewertung: {resp['evaluation']:.4f} (Erwartet: Nahe 1.0 für Weiß, -1.0 für Schwarz)")
        print(f"👀 Visits: {resp['visits']}")

        print("💡 Top Alternativen:")
        for move in resp['top_moves'][:3]:
            print(f"   - {move['move']}: {move['score']:.4f} (Visits: {move['visits']})")

    except Exception as e:
        print(f"❌ Verbindung fehlgeschlagen: {e}")


if __name__ == "__main__":
    # Szenario 1: Matt in 1 (Weiß am Zug)
    # Stellung: Weißer Läufer auf c4, Dame auf f3. Schwarz hat e5 gespielt.
    # Zug Qxf7 ist Schachmatt.
    mate_in_one = "r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 4"
    test_fen("SCHÄFERMATT (Matt in 1)", mate_in_one)

    # Szenario 2: Gewonnenes Endspiel
    # Stellung: Weißer König + Dame gegen schwarzen König
    endgame = "8/8/8/4k3/8/8/4Q3/4K3 w - - 0 1"
    test_fen("ENDSPIEL (K+D vs K)", endgame)