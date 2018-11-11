class Gene {
    constructor(cdsStart, cdsEnd, exonStarts, exonEnds) {
        this.cdsStart = cdsStart;
        this.cdsEnd = cdsEnd;
        this.exons = this.initializeExons(exonStarts, exonEnds);
    }

    initializeExons(exonStarts, exonEnds) {
        var exons = [];
        var length = exonStarts.length;
    
        for (let i = 0; i < length; i++) {
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
  
  