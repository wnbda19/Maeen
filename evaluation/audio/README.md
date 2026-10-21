# Evaluation recordings — development only

20 unmodified five-second WAV clips from the **CC BY 3.0 ESC-10 subset** of Karol J. Piczak's ESC dataset. Metadata in samples.json identifies category, original Freesound source ID and take. Two clips per ESC-10 category, selected in original CSV order without looking at predictions; 18 distinct original source IDs. These files are not MAEEN microphone recordings or training data.

Source: https://github.com/karolpiczak/ESC-50

Audio URLs: `https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/{filename}` using each filename in samples.json.

License declaration: https://github.com/karolpiczak/ESC-50/blob/master/README.md

Full credit and original individual-clip license ledger: ATTRIBUTION.txt, copied from the dataset author's LICENSE. Credit Karol J. Piczak, *ESC: Dataset for Environmental Sound Classification*, ACM Multimedia 2015, DOI https://doi.org/10.1145/2733373.2806390, and each Freesound creator identified in that ledger. The ESC-10 subset license is https://creativecommons.org/licenses/by/3.0/ . Original audio has not been modified; browser evaluation temporarily decodes/resamples in memory.

The full ESC-50 collection is not licensed the same way. Only filenames with esc10=True are present as audio here. Nothing in this directory is copied to app/public or app/dist. Keep evaluation inputs separate from deployable assets and from Phase 3 sign-language data.
