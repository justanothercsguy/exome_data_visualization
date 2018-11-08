# exome_data_visualization

This is the protoype for a website to visualize genomic data consisting of exons and variants for genes.
* Database: Sqlite
* Backend: Python, Django Framework
* Frontend: JavaScript (vanilla) and d3 js version 4

The sqlite database file will contain a table called exons with the names of genes and exon positions. 
It will also contain a variant table for each gene in the exons table. 
For example, the gene **PCSK9** will have a variant table named **variants_PCSK9**.
