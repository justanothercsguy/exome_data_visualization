class Gene {
    constructor(cdsStart, cdsEnd, exonStarts, exonEnds, exonCount) {
        this.cdsStart = cdsStart;
        this.cdsEnd = cdsEnd;
        this.exons = this.initializeExons(exonStarts, exonEnds, exonCount);
        this.exonCount = exonCount;
    }

    initializeExons(exonStarts, exonEnds, exonCount) {
        var exons = [];    
        for (let i = 0; i < exonCount; i++) {
            exons.push(new Exon(exonStarts[i], exonEnds[i]));
        }
        return exons;
    }
}

class Exon {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    getLength() {
        return this.end - this.start;
    }
}
  
  