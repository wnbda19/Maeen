# Korean Sign Language research — Phase 5

Investigated 2026-10-21 using Korean institutional and academic primary sources. **KSL here means Korean Sign Language (한국 수어), not Kenyan Sign Language, Korean text, or ASL with Korean labels.** No KSL recognizer, data corpus or weights were downloaded or trained.

## Candidates

| Source / owner | Vocabulary, samples and signers | Data and model availability | Rights / suitability |
|---|---|---|---|
| [Yonsei EIS Lab KSL dataset](https://sites.google.com/view/eislab-yonsei/yonsei-ksl-dataset), Hyeonjung Park, Youngki Lee, JeongGil Ko | 50 vocabularies, 20 participants; approximately 5,000 original depth-only videos plus approximately 5,000 refactored videos. Exact word list is in the archive README, not verified here. | iPhone X depth-camera recordings. Original and refactored versions are not independent samples. Associated *Enabling Real-time Sign Language Translation on Mobile Platforms with On-board Depth Cameras* research. No compatible rights-cleared RGB browser checkpoint was established. | Institution explicitly declares CC BY 4.0. Potentially legally useful with attribution, but MAEEN's ordinary browser webcam does not supply its depth modality. A depth-model result cannot be represented as an RGB-camera implementation. Not integrated. |
| [AI-Hub 수어 영상, ID 103](https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&dataSetSn=103&topMenu=100), NIA and constructing organizations, including Testworks | Official page: 536,000 MP4 clips: 500,000 studio clips from 20 providers in five simultaneous views; 21,000 fingerspelling/numeral clips from 21 crowdsourced providers; 15,000 avatar clips. Describes 2,000 sentences, 3,000 words and 1,000 fingerspelling/numeral items. These volumes are not independent human performances and the provider groups must not simply be added into a unique signer count. | RGB videos; time-aligned morpheme/nonmanual JSON, per-frame body/hand/face keypoints. Official model/code information exists. Signer/view/session grouping needs the actual metadata; no model accuracy was measured by MAEEN. | [Official AI-Hub policy](https://aihub.or.kr/intrcn/guid/usagepolicy.do) requires separate agreement for overseas entities and overseas transfer, and limits providing source data to third parties. Dataset page restricts normal applications to domestic applicants. Public metadata is not permission for MAEEN to download/use/export these assets. No access bypass attempted. |
| [AI-Hub 재난 안전 정보 전달을 위한 수어영상 데이터, ID 636](https://www.aihub.or.kr/aihubdata/data/view.do?aihubDataSe=data&currMenu=115&dataSetSn=636&topMenu=100), NIA and listed constructing/participating organizations | Official tables list 164,375 Korean sentences and 201,026 sign videos/scripts; overview separately says 201,684 sets. These are different/discrepant published measures, not a confirmed unique-word vocabulary count. Signer count was not established from the public specification. | MP4, TXT, JSON/XML keypoints, morphemes and facial/nonmanual timing. Model links describe Korean-text-to-sign generation/translation components, which are not proof of webcam sign recognition. | Same access/overseas/redistribution policy problem. No explicit MAEEN trained-weight deployment grant established. No media/model downloads. |

The institutional statements above distinguish a usable data license from compatibility and a usable pretrained model. Yonsei demonstrates that some genuinely Korean-sign data has clear reuse rights; it does not establish an available model for MAEEN's RGB webcam.

## Evaluation feasibility

Yonsei: 20 participants could permit signer-disjoint evaluation if stable participant IDs and class coverage are confirmed. Keep original/refactored clips grouped; require actual depth input and a modality-compatible model. Do not mix derivatives across partitions.

AI-Hub 103: group all simultaneous views of a performance and all sessions of a signer in one partition. Keep avatars distinct from human evaluation. IDs, provider overlap and sample provenance must be confirmed after authorized access; no fabricated signer-independent result is possible now.

AI-Hub 636: request signer/session inventory, consent/use conditions and recognition-specific baseline/checkpoint documentation. Korean sentence counts, model BLEU or pose-generation similarity cannot be presented as word-recognition accuracy.

## Product decision

KSL remains visible as **Research / Model unavailable** for both Letters and Words. Registry model URLs/assets/preprocessing are empty; entering KSL does not fetch a model or start capture. KSL Learn does not display the Arabic label gallery. No supported KSL class count, accuracy, macro F1, model size or inference latency is claimed. Live webcam testing is not applicable until a real compatible model exists.

Next legitimate paths: obtain provider/NIA authorization for overseas RGB research plus explicit deployment rights, or pursue Yonsei with actual supported depth hardware and a separately validated adapter. Before integration, document checkpoint license, label manifest, feature definition, temporal input, signer-disjoint splits and on-device performance. No first-party Arabic collector files were repurposed or changed.
