"""Independent experimental ASL static-letter model; no Arabic training code imports."""
from pathlib import Path
import json, hashlib, time, tempfile, contextlib
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
LABELS=[c for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' if c not in 'JZ']

def normalize(points, handedness):
    p=np.asarray(points,dtype=np.float32)
    if p.shape!=(21,3) or not np.isfinite(p).all():raise ValueError('Invalid hand')
    p=p-p[0]
    scale=float(np.linalg.norm(p[9]))
    if scale<1e-4:raise ValueError('Collapsed hand')
    p=p/scale
    if handedness=='Left':p[:,0]*=-1
    return p.reshape(63)

def extract(folder, cache):
    import cv2, mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision
    if cache.exists():return np.load(cache,allow_pickle=False)
    files=sorted(p for p in folder.rglob('*') if p.suffix.lower() in ('.jpg','.jpeg','.png') and p.parent.name.upper() in LABELS)
    rows=[];labels=[];ledger=[];seen=set(); counts={c:0 for c in LABELS};misses={c:0 for c in LABELS}
    options=vision.HandLandmarkerOptions(base_options=python.BaseOptions(model_asset_buffer=(ROOT/'models/hand_landmarker.task').read_bytes()),running_mode=vision.RunningMode.IMAGE,num_hands=1)
    with tempfile.TemporaryDirectory(prefix='maeen-asl-') as scratch, contextlib.chdir(scratch), vision.HandLandmarker.create_from_options(options) as detector:
        for i,path in enumerate(files):
            raw=path.read_bytes();digest=hashlib.sha256(raw).hexdigest()
            if digest in seen:continue
            seen.add(digest);label=path.parent.name.upper();counts[label]+=1
            rgb=cv2.cvtColor(cv2.imdecode(np.frombuffer(raw,np.uint8),cv2.IMREAD_COLOR),cv2.COLOR_BGR2RGB)
            result=detector.detect(mp.Image(image_format=mp.ImageFormat.SRGB,data=np.ascontiguousarray(rgb)))
            if not result.hand_landmarks:misses[label]+=1;continue
            points=np.array([[p.x,p.y,p.z] for p in result.hand_landmarks[0]])
            try:features=normalize(points,result.handedness[0][0].category_name)
            except ValueError:misses[label]+=1;continue
            rows.append(features);labels.append(LABELS.index(label));ledger.append({'file':str(path.relative_to(folder)),'sha256':digest,'label':label})
            if i%200==0:print(f'{folder.name}: {i}/{len(files)}',flush=True)
    np.savez(cache,x=np.array(rows,dtype=np.float32),y=np.array(labels,dtype=np.int64))
    cache.with_suffix('.json').write_text(json.dumps({'counts':counts,'misses':misses,'landmarks':ledger},indent=2),encoding='utf8')
    return np.load(cache,allow_pickle=False)

def main():
    import torch
    torch.manual_seed(20261021);np.random.seed(20261021);torch.set_num_threads(4)
    data=ROOT/'phase5/data';out=ROOT/'sign-models/asl-static';out.mkdir(parents=True,exist_ok=True)
    train=extract(data/'asl-cc0',data/'train-features.npz')
    # Test source is never used for optimization, early stopping or thresholds.
    x=torch.from_numpy(train['x']);y=torch.from_numpy(train['y'])
    model=torch.nn.Sequential(torch.nn.Linear(63,128),torch.nn.ReLU(),torch.nn.Linear(128,64),torch.nn.ReLU(),torch.nn.Linear(64,24))
    opt=torch.optim.AdamW(model.parameters(),lr=.001,weight_decay=.01)
    for epoch in range(160):
        for batch in torch.randperm(len(x)).split(128):
            opt.zero_grad();loss=torch.nn.functional.cross_entropy(model(x[batch]),y[batch]);loss.backward();opt.step()
    model.eval()
    layers=[{'input':m.in_features,'output':m.out_features,'weights':m.weight.detach().numpy().reshape(-1).tolist(),'bias':m.bias.detach().numpy().tolist()} for m in model if isinstance(m,torch.nn.Linear)]
    payload={'format':'maeen-asl-mlp-v1','version':'1.0.0-experimental','labels':LABELS,'normalization':'wrist-middle-mcp-handedness-v1','layers':layers}
    path=out/'model.json';path.write_text(json.dumps(payload,separators=(',',':')),encoding='utf8')
    (out/'labels.json').write_text(json.dumps({'version':payload['version'],'labels':LABELS,'excludedDynamic':['J','Z']},indent=2),encoding='utf8')
    test=extract(data/'asl-test-cc0',data/'test-features.npz')
    a=json.loads((data/'train-features.json').read_text());b=json.loads((data/'test-features.json').read_text())
    if {r['sha256'] for r in a['landmarks']} & {r['sha256'] for r in b['landmarks']}:raise ValueError('Cross-source byte duplicate')
    with torch.no_grad():
        started=time.perf_counter();prob=model(torch.from_numpy(test['x'])).softmax(1).numpy();elapsed=time.perf_counter()-started
    pred=prob.argmax(1);actual=test['y'];matrix=np.zeros((24,24),dtype=int)
    for t,p in zip(actual,pred):matrix[t,p]+=1
    per=[]
    for i,label in enumerate(LABELS):
        tp=int(matrix[i,i]);support=int(matrix[i].sum());precision=tp/max(1,int(matrix[:,i].sum()));recall=tp/max(1,support);f1=2*precision*recall/max(1e-12,precision+recall)
        per.append({'label':label,'support':support,'precision':precision,'recall':recall,'f1':f1})
    sorted_scores=np.sort(prob,axis=1);accepted=(sorted_scores[:,-1]>=.7)&(sorted_scores[:,-1]-sorted_scores[:,-2]>=.15)
    report={'trainingImagesWithLandmarks':len(x),'testImagesWithLandmarks':len(actual),'trainUniqueImages':sum(a['counts'].values()),'testUniqueImages':sum(b['counts'].values()),'trainDetectionMisses':a['misses'],'testDetectionMisses':b['misses'],'signers':None,'signerIndependent':False,'validation':'No signer-labelled validation partition available; fixed 160 epochs, no early stopping or test-driven hyperparameter selection','accuracyConditionalOnLandmarkDetection':float((pred==actual).mean()),'accuracyIncludingNoHandAsMiss':float((pred==actual).sum()/sum(b['counts'].values())),'macroF1':float(np.mean([p['f1'] for p in per])),'singleFrameAcceptedCount':int(accepted.sum()),'singleFrameAcceptedCorrect':int(((pred==actual)&accepted).sum()),'threshold':.7,'margin':.15,'perClass':per,'confusionMatrix':matrix.tolist(),'pythonBatchMsPerImage':elapsed/len(actual)*1000,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'architecture':'63-128-ReLU-64-ReLU-24 MLP','seed':20261021,'epochs':160}
    (ROOT/'docs/phase5/asl-evaluation.json').write_text(json.dumps(report,indent=2),encoding='utf8')
    # Real extracted landmark vector and logits for browser/Python parity tests.
    with torch.no_grad():logits=model(torch.from_numpy(test['x'][:1])).numpy()[0]
    (ROOT/'docs/phase5/asl-parity.json').write_text(json.dumps({'features':test['x'][0].tolist(),'logits':logits.tolist(),'source':b['landmarks'][0]}),encoding='utf8')
    print(json.dumps({k:v for k,v in report.items() if k not in ('perClass','confusionMatrix','trainDetectionMisses','testDetectionMisses')},indent=2),flush=True)

if __name__=='__main__':main()
