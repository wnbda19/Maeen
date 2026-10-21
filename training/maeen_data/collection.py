"""Private first-party exports -> reviewed dataset; no network or fitting."""
import argparse
import math
import shutil
from pathlib import Path

from .dataset import read_json, read_jsonl, write_json, safe_path, sha256_file, signer_assignments

CONFIG = Path(__file__).resolve().parents[2] / 'collection/profiles.json'


def progress_report(rows, profile):
    def valid(r):
        return r.get('source') == 'first-party' and r.get('profileId') == profile['id'] and r.get('signerId') in profile['signers'] and r.get('wordId') in profile['wordIds'] + ['N000', 'N001'] and type(r.get('repetition')) is int and 1 <= r['repetition'] <= (profile['negativeRepetitions'] if r['wordId'].startswith('N') else profile['repetitions'])
    rows = [r for r in rows if valid(r)]
    def slots(accepted, negative):
        return {(r['signerId'], r['wordId'], r['repetition']) for r in rows if r['wordId'].startswith('N') == negative and (not accepted or (r.get('qc', {}).get('accepted') is True and r.get('qc', {}).get('languageReviewer') and r.get('qc', {}).get('technicalReviewer')))}
    accepted_positive, accepted_negative = len(slots(True, False)), len(slots(True, True))
    return {'profileId':profile['id'], 'positiveTarget':profile['positiveTarget'], 'negativeTarget':profile['negativeTarget'],
            'recordedPositiveSlots':len(slots(False,False)), 'acceptedPositiveSlots':accepted_positive,
            'recordedNegativeSlots':len(slots(False,True)), 'acceptedNegativeSlots':accepted_negative,
            'remainingPositive':profile['positiveTarget']-accepted_positive,
            'remainingNegative':profile['negativeTarget']-accepted_negative,
            'trainingReady':False, 'note':'Coverage only. Consent, linguistic approval, hashes/features and locked splits also required.'}


def validate_collection_ready(rows, profile):
    if any(r.get('profileId') != profile['id'] for r in rows):
        raise ValueError('Collection profiles cannot be mixed')
    report = progress_report(rows, profile)
    accepted = [r for r in rows if r.get('qc', {}).get('accepted') is True]
    slots = [(r.get('signerId'), r.get('wordId'), r.get('repetition')) for r in accepted]
    if len(slots) != len(set(slots)):
        raise ValueError('Keep only one accepted take per signer/class/repetition slot')
    if report['remainingPositive'] or report['remainingNegative']:
        raise ValueError('Controlled collection incomplete: every signer/class/repetition requires accepted original recordings')
    for signer in profile['signers']:
        for word in profile['wordIds']:
            clips=[r for r in accepted if r.get('signerId')==signer and r.get('wordId')==word]
            if len({r.get('condition') for r in clips})<3 or len({r.get('speed') for r in clips})<2 or len({r.get('distanceMetres') for r in clips})<2 or len({r.get('sessionId') for r in clips})<3:
                raise ValueError('Controlled condition/speed/distance/session coverage incomplete')
    return report


def validate_export(row, consents, profile):
    if row.get('schemaVersion') != 'maeen-collection-v2' or row.get('source') != 'first-party' or row.get('captureType') != 'real-camera' or row.get('mirrored') is not False or row.get('profileId') != profile['id']:
        raise ValueError('Only matching first-party collection exports accepted; reference footage is excluded')
    signer = row.get('signerId')
    consent = next((c for c in consents if c.get('signerId') == signer), {})
    if row.get('consent') is not True or any(consent.get(k) is not True for k in ('recording','training','modelDistribution')) or consent.get('withdrawn') is not False or not row.get('consentRef') or consent.get('consentRef') != row['consentRef']:
        raise ValueError('Active evidenced recording/training/distribution consent required')
    if signer not in signer_assignments(profile['splits']) or row.get('wordId') not in profile['wordIds']+['N000','N001']:
        raise ValueError('Unknown signer or class')
    import re
    if not re.fullmatch(r'C\d{2}',row.get('sessionId','')) or type(row.get('take')) is not int or not 1 <= row['take'] <= 99:
        raise ValueError('Invalid session/take')
    limit = profile['negativeRepetitions'] if row['wordId'].startswith('N') else profile['repetitions']
    if type(row.get('repetition')) is not int or not 1 <= row['repetition'] <= limit:
        raise ValueError('Invalid repetition')
    clip = f'{signer}_{row["wordId"]}_{row["sessionId"]}_R{row["repetition"]:02}_T{row["take"]:02}'
    file = row.get('file','')
    suffix = Path(file).suffix.lower()
    if suffix not in ('.mp4','.webm') or row.get('clipId') != clip or file != f'raw/{signer}/{row["sessionId"]}/{row["wordId"]}/{clip}{suffix}':
        raise ValueError('Invalid export filename/path')
    seconds = row.get('durationSeconds')
    if type(seconds) not in (float,int) or not math.isfinite(seconds) or not 3 <= seconds <= 10.25:
        raise ValueError('Invalid elapsed duration')
    if row.get('condition') not in ('bright-plain','soft-plain','bright-textured','soft-textured','alternate-room') or row.get('speed') not in ('comfortable','slower-natural','brisk-natural') or type(row.get('distanceMetres')) not in (int,float) or not 1 <= row['distanceMetres'] <= 3:
        raise ValueError('Controlled capture conditions required')
    words = read_json(CONFIG)['words']
    word = next((w for w in words if w['id']==row['wordId']),None)
    if row.get('officialTermId') != (word['officialTermId'] if word else None):
        raise ValueError('Official reference mapping mismatch')
    return clip


def probe_recording(path):
    import cv2
    cap=cv2.VideoCapture(str(path))
    try:
        if not cap.isOpened():raise ValueError('Recording cannot be decoded')
        fps=cap.get(cv2.CAP_PROP_FPS)
        if not 15 <= fps <= 120:raise ValueError('Decoded FPS outside 15–120')
        frames=0;width=height=0
        while True:
            ok,image=cap.read()
            if not ok:break
            frames+=1;height,width=image.shape[:2]
            if frames>1200:raise ValueError('Recording too long')
        seconds=frames/fps
        if not 3 <= seconds <= 10.25 or width<640 or height<480:raise ValueError('Decoded duration/framing resolution rejected')
        return {'frames':frames,'fps':fps,'durationSeconds':seconds,'width':width,'height':height}
    finally:cap.release()


def import_exports(exports, root, consents, profile):
    exports,root=Path(exports).resolve(),Path(root).resolve()
    index=root/'metadata/recordings.jsonl'
    old=read_jsonl(index) if index.exists() else []
    if any(r.get('profileId')!=profile['id'] for r in old):raise ValueError('Use separate dataset roots per profile')
    for row in old:validate_export(row,consents,profile)
    by_id={r['clipId']:r for r in old};by_hash={r['sha256']:r['clipId'] for r in old};pending=[]
    for sidecar in sorted(exports.glob('*.json')):
        row=read_json(sidecar);clip=validate_export(row,consents,profile)
        source=safe_path(exports,Path(row['file']).name);target=safe_path(root,row['file'])
        digest=sha256_file(source)
        if clip in by_id:
            previous=by_id[clip]
            if previous['sha256']!=digest or sha256_file(target)!=digest or previous['consentRef']!=row['consentRef']:raise ValueError('Existing clip/evidence changed')
            continue
        if digest in by_hash:raise ValueError('Duplicate recording bytes cannot create a repetition')
        if target.exists():raise ValueError('Destination exists; no overwrite allowed')
        decoded=probe_recording(source)
        if abs(decoded['durationSeconds']-row['durationSeconds'])>0.6:raise ValueError('Decoded and capture-clock duration disagree')
        row={**row,'sha256':digest,'decoded':decoded,'qc':{'accepted':False,'languageReviewer':'','technicalReviewer':'','reason':'awaiting-review'}}
        pending.append((source,target,row));by_id[clip]=row;by_hash[digest]=clip
    # Validate every sidecar before copying anything. Never move originals.
    for source,target,row in pending:
        target.parent.mkdir(parents=True,exist_ok=True)
        with source.open('rb') as incoming, target.open('xb') as destination:
            shutil.copyfileobj(incoming,destination)
        if sha256_file(target)!=row['sha256']:raise ValueError('Recording changed during copy; reconcile against original export')
    if pending:
        index.parent.mkdir(parents=True,exist_ok=True)
        import json
        index.write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in by_id.values())+'\n',encoding='utf-8')
    return list(by_id.values())


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['import','progress','accepted'])
    parser.add_argument('--profile',choices=['reference25','mvp15'],default='reference25')
    parser.add_argument('--root',type=Path,required=True)
    parser.add_argument('--exports',type=Path)
    parser.add_argument('--consents',type=Path)
    parser.add_argument('--output',type=Path)
    args=parser.parse_args();profile=next(p for p in read_json(CONFIG)['profiles'] if p['id']==args.profile)
    if args.command=='import':
        if not args.exports or not args.consents:parser.error('import requires --exports and --consents')
        rows=import_exports(args.exports,args.root,read_json(args.consents),profile)
    else:
        index=args.root/'metadata/recordings.jsonl';rows=read_jsonl(index) if index.exists() else []
        for row in rows:
            if sha256_file(safe_path(args.root,row['file']))!=row['sha256']:raise ValueError('Changed/missing recording')
    report=progress_report(rows,profile)
    if args.command=='accepted':
        if not args.consents or not args.output:parser.error('accepted requires --consents and --output JSONL')
        consents=read_json(args.consents)
        for row in rows:validate_export(row,consents,profile)
        rows=[r for r in rows if r.get('qc',{}).get('accepted') is True and r['qc'].get('languageReviewer') and r['qc'].get('technicalReviewer')]
        slots=[(r['signerId'],r['wordId'],r['repetition']) for r in rows]
        if len(slots)!=len(set(slots)):raise ValueError('Multiple accepted takes for the same logical slot')
        import json
        args.output.parent.mkdir(parents=True,exist_ok=True)
        args.output.write_text('\n'.join(json.dumps(r,ensure_ascii=False) for r in rows)+'\n',encoding='utf-8')
        print(f'Wrote {len(rows)} QC-approved rows; no fitting performed.')
        return
    if args.output:write_json(args.output,report)
    import json
    print(json.dumps(report,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
