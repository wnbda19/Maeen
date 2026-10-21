"""Local-only authorized library staging. No HTTP client or acquisition code.

Staging is not approval to train: the main training CLI remains closed to this
source until the licensed corpus, signer coverage and vocabulary are reviewed.
"""
import argparse
import re
from datetime import date
from urllib.parse import urlparse

from .dataset import read_json, read_jsonl, safe_path, sha256_file, validate_partitions, write_json

REQUIRED_RIGHTS = ('programmaticAccess', 'downloadStore', 'landmarkExtraction',
                   'mlTraining', 'modelRedistribution', 'competitionDemo', 'publicWebDeployment')


def ingest_official(root, rows, grant, splits, labels):
    """Validate a reviewed written grant before touching any local video file.

    The operator must verify authenticity/chain of title; booleans alone cannot
    establish legal permission. Commercial rights are recorded separately and
    never inferred from competition permission.
    """
    if grant.get('source') != 'saudi-sign-library' or grant.get('status') != 'approved' or grant.get('issuer') != 'Saudi Hearing Disability Association' or not grant.get('reviewedBy'):
        raise ValueError('Reviewed Association authorization required')
    try:
        expired = date.fromisoformat(grant.get('expiresOn', '')) < date.today()
    except (ValueError, TypeError):
        raise ValueError('Explicit authorization expiry/review date required') from None
    if expired or any(grant.get('rights', {}).get(key) is not True for key in REQUIRED_RIGHTS):
        raise ValueError('Expired authorization or missing explicit rights')
    evidence = safe_path(root, grant.get('evidenceFile'))
    digest = sha256_file(evidence)
    if digest != grant.get('evidenceSha256'):
        raise ValueError('Permission evidence changed')
    allowed = grant.get('termIds', [])
    if not isinstance(allowed, list) or not allowed or any(not isinstance(i, str) or not i.isdigit() for i in allowed):
        raise ValueError('Explicit term-ID scope required')
    output = []
    for row in rows:
        term = row.get('officialTermId')
        url = urlparse(row.get('officialUrl', ''))
        if term not in allowed or url.scheme != 'https' or url.netloc != 'sshi.sa' or not re.fullmatch(r'/category/\d+/' + re.escape(term or ''), url.path) or url.query or url.fragment:
            raise ValueError('Official source URL/scope mismatch')
        if row.get('signerEvidence') != 'association-metadata' or row.get('sessionEvidence') != 'association-metadata' or not row.get('sessionId'):
            raise ValueError('Verified signer/session metadata required; visual guesses cannot establish independence')
        qc = row.get('qc', {})
        if row.get('captureType') != 'real-camera' or row.get('mirrored') is not False or qc.get('accepted') is not True or not qc.get('languageReviewer') or not qc.get('technicalReviewer'):
            raise ValueError('Real unmirrored reviewed recordings required')
        clip_id = row.get('clipId', '')
        if not isinstance(clip_id, str) or not re.fullmatch(r'[A-Za-z0-9_-]{1,100}', clip_id):
            raise ValueError('Unsafe clip ID')
        file = safe_path(root, row.get('file'))
        if file.suffix.lower() != '.mp4' or not file.is_file():
            raise ValueError('Local authorized MP4 required')
        split = next((part for part, ids in splits.items() if row.get('signerId') in ids), None)
        output.append({**row, 'source': 'saudi-sign-library', 'split': split,
                       'sha256': sha256_file(file), 'authorizationSha256': digest,
                       'authorizationExpiresOn': grant['expiresOn'],
                       'commercialUseAuthorized': grant.get('rights', {}).get('commercialUse') is True})
    validate_partitions(output, splits, labels)
    return output


def main():
    parser = argparse.ArgumentParser(description='Stage local authorized official-library recordings only; never downloads or trains')
    for name in ('root', 'metadata', 'authorization', 'splits', 'vocabulary', 'output'):
        parser.add_argument('--' + name, required=True)
    args = parser.parse_args()
    vocabulary = read_json(args.vocabulary)
    labels = [word['id'] for word in vocabulary['proposedWords']] + vocabulary['negativeClasses']
    rows = ingest_official(args.root, read_jsonl(args.metadata), read_json(args.authorization), read_json(args.splits), labels)
    write_json(args.output, rows)
    print(f'Staged {len(rows)} authorized local clips. Training remains blocked pending corpus acceptance.')


if __name__ == '__main__':
    main()
