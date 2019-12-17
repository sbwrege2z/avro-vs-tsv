# avro-vs-tsv

Testing the speed of decoding Avro and TSV files

The program creates 10,000 sample users.
The sample users are saved in an avro file (data/sample.avro), and tab-separated file (data/sample.tsv), and a gzipped tab-seperated file data/sample.tsv(data/sample.tsv.gz).

The different sample files are then decoded and the metrics are reported.

For the most part, I don't see much of a performance benefit in the decoding process. I really like the type guarantees of avro, but I was hoping there would be more of a performace boost.

[![Run on Repl.it](https://repl.it/badge/github/sbwrege2z/avro-vs-tsv)](https://repl.it/github/sbwrege2z/avro-vs-tsv)
