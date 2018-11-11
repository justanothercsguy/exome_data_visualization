class Gene {
    // NOTE: danger in this design because intializeExons depends
    // on exonCount input coming before exonStarts, exonEnds
    constructor(cdsStart, cdsEnd, exonCount, exonStarts, exonEnds) {
        this.cdsStart = cdsStart;
        this.cdsEnd = cdsEnd;
        this.exonCount = exonCount;
        this.exons = this.initializeExons(exonStarts, exonEnds, exonCount);
    }

    initializeExons(exonStarts, exonEnds, exonCount) {
        var exons = [];    
        for (var i = 0; i < exonCount; i++) {
            exons.push(new Exon(exonStarts[i], exonEnds[i]));
        }
        return exons;
    }

    // NOTE: excluding functions to remove exons before cdsStart and after cdsEnd
    // because such entries are extremely unlikely to occur - will add them in 
    // later once the other data processing on exons are done


    doesExonContainCdsStart(exon, cdsStart) {
        // Don't split in the case where exonStart >= cdsStart and everything is coding,
        // or the case where exonEnd < cdsStart and everything is non-coding
        return (exon.start < cdsStart && exon.end >= cdsStart);
    }
      
      
    doesExonContainCdsEnd(exon, cdsEnd) {
        // Don't split in the case where exonEnds[length - 1] <= cdsEnd and everything is coding,
        // or the case where exonStarts[length - 1] > cdsEnd and everything is non-coding 
        return (exon.start <= cdsEnd && exon.end > cdsEnd);
    }

    // Let i be the index of the exon that contains cdsStart within its domain
    // Let j be the index of the exon that contains cdsEnd within its domain
    // If (cdsStart - exon[i].start) > nonCodingLengthLimit, then we need to change exon[i].start
    // so that (cdsStart - exon[i].start) = 200. Same thing if (exon[j].end - cdsEnd) > 200.
    // Here, (cdsStart - exon[i].start) and (exon[j].end - cdsEnd) are the lengths of the non-coding
    // exon partitions.
    limitNonCodingExonLength(nonCodingLengthLimit) {
        var firstExon = this.exons[0];
        var lastExon = this.exons[this.exonCount - 1];
        var cdsStart = this.cdsStart;
        var cdsEnd = this.cdsEnd;

        if (this.doesExonContainCdsStart(firstExon, cdsStart)
        && (cdsStart - firstExon.start > nonCodingLengthLimit)) {
            this.exons[0] = new Exon(cdsStart - nonCodingLengthLimit, firstExon.end);
        }

        if (this.doesExonContainCdsEnd(lastExon, cdsEnd)
        && (lastExon.end - cdsEnd > nonCodingLengthLimit)) {
            this.exons[this.exonCount - 1] = 
                new Exon(lastExon.start, cdsEnd + nonCodingLengthLimit);
        }
    }

    getExonLengths() {
        var exonLengths = [];
        for (var i = 0; i < this.exonCount; i++) {
            exonLengths.push(this.exons[i].getLength());
        }
        return exonLengths;
    }

    getSumOfExonLengths() {
        var sum = 0;
        var exonLengths = this.getExonLengths();
        for (var i = 0; i < this.exonCount; i++) {
            sum += exonLengths[i];
        }
        return sum;
    }

    // sum of all intron lengths will equal to half of the sum of all exon lengths
    getUniformIntronLength() {
        return Math.ceil((this.getSumOfExonLengths() / 2) / (this.exonCount - 1));
    }

    getSumOfUniformIntronLengths() {
        return this.getUniformIntronLength() * (this.exonCount - 1);
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
