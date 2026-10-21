"""Run from training/: python -m maeen_data --help."""
import argparse
import sys
from pathlib import Path

from .dataset import ingest, read_json, read_jsonl, write_json


def main():
    parser = argparse.ArgumentParser(description="MAEEN first-party collection pipeline; never uploads data")
    parser.add_argument("command", choices=["ingest", "extract", "audit", "train", "calibrate", "evaluate", "export"])
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--manifest", type=Path)
    parser.add_argument("--metadata", type=Path)
    parser.add_argument("--consents", type=Path, required=True)
    parser.add_argument("--vocabulary", type=Path, default=Path("config/vocabulary.reference25.json"))
    parser.add_argument("--splits", type=Path, default=Path("config/splits.reference25.json"))
    parser.add_argument("--config", type=Path, default=Path("config/experiment.json"))
    parser.add_argument("--tasks", type=Path, default=Path("assets"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--run", type=Path)
    parser.add_argument("--architecture", choices=["tcn", "gru", "bilstm", "stgcn"], default="tcn")
    args = parser.parse_args()
    vocabulary, splits, consents = read_json(args.vocabulary), read_json(args.splits), read_json(args.consents)
    labels = [word["id"] for word in vocabulary["proposedWords"]] + vocabulary["negativeClasses"]
    if args.command == "ingest":
        if not args.metadata or not args.output:
            parser.error("ingest requires --metadata and --output")
        result = ingest(args.root, read_jsonl(args.metadata), consents, splits, labels)
        write_json(args.output, result)
        print(f"Ingested {len(result)} approved real recordings; no training performed.")
        return
    if not args.manifest:
        parser.error("--manifest required")
    rows = read_json(args.manifest)
    # Revalidate consent and actual raw files even when reading an existing manifest.
    refreshed = ingest(args.root, rows, consents, splits, labels)
    if any(a["sha256"] != b.get("sha256") for a, b in zip(refreshed, rows)):
        raise ValueError("Raw recordings changed since manifest creation")
    if args.command == "extract":
        from .extract import extract_clip
        reports = [extract_clip(args.root, row, args.tasks) for row in rows]
        write_json(args.output or args.root / "manifests/extraction.json", reports)
        print(f"Extracted {len(reports)} real recordings; no model trained.")
        return
    from .train import fit, evaluate, validate_training_ready, load_features
    validate_training_ready(rows, vocabulary, consents, splits)
    if args.command == "audit":
        for split in ("train", "validation", "test"):
            load_features(args.root, [row for row in rows if row["split"] == split], labels)
        print("Consent, signer partitions, raw hashes and feature hashes verified.")
    elif args.command == "train":
        if not args.output:
            parser.error("train requires a fresh --output run directory")
        print(fit(args.root, rows, vocabulary, consents, splits, read_json(args.config), args.output, args.architecture))
    else:
        if not args.run:
            parser.error("--run required")
        run = read_json(args.run / "run.json")
        if run["manifest"] != rows or run["labels"] != labels or run["splits"] != splits:
            raise ValueError("Run does not match current consent-checked dataset/vocabulary/splits")
        if args.command == "calibrate":
            from .calibrate import calibrate
            print(calibrate(args.root, args.run))
        elif args.command == "evaluate":
            print(evaluate(args.root, args.run))
        elif args.command == "export":
            if not args.output:
                parser.error("export requires --output")
            import torch
            from .models import make_model
            from .export import export_model
            # A validation sample, never a generated substitute, is used for export parity.
            values, _ = load_features(args.root, [row for row in rows if row["split"] == "validation"][:1], labels)
            model = make_model(run["architecture"], len(labels))
            model.load_state_dict(torch.load(args.run / "weights.pt", map_location="cpu", weights_only=True))
            report = export_model(model, args.output, values.numpy())
            write_json(args.output.with_suffix(".parity.json"), report)
            print(report)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, FileNotFoundError) as error:
        print(f"Blocked: {error}", file=sys.stderr)
        raise SystemExit(2)
