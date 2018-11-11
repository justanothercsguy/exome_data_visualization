// Step 1: initialize exons from exonStarts and exonEnds
// Step 2: trim non coding exon lengths by limit
// step 3: calculate length of each exon 
// step 4: calculate sum of lengths of exons
// step 5: calculate length of uniform intron 
// step 6: calculate sum of lengths of uniform introns
// step 7: calculate exon array given uniform introns


class Gene {
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

    getExons() {
        return this.exons;
    }

    // Initially I pass in exonStarts and exonEnds but then use them to 
    // initialize an array of Exon objects in the Gene object. 
    // exonStarts and exonEnds are not stored in the Gene object as variables,
    // but are instead derived from the array of Exon objects. 
    // This means that if I want to get modified values of exonStarts and exonEnds,
    // I have to first create a modified array of Exons and then call 
    // getExonStarts() or getExonEnds()
    getExonStarts(exonArray) {
        var exonStarts = [];
        var length = this.exonCount;

        for (var i = 0; i < length; i++) {
            exonStarts.push(exonArray[i].start);
        }
        return exonStarts;
    }

    getExonEnds(exonArray) {
        var exonEnds = [];
        var length = this.exonCount;

        for (var i = 0; i < length; i++) {
            exonEnds.push(exonArray[i].end);
        }
        return exonEnds;
    }


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
        var firstExon = this.getExons()[0];
        var lastExon = this.getExons()[this.exonCount - 1];
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
        var exons = this.getExons();
        for (var i = 0; i < this.exonCount; i++) {
            exonLengths.push(exons[i].getLength());
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

    getExonsWithUniformIntronLength() {
        var exonCount = this.exonCount;
        var exonStarts = this.getExonStarts(this.getExons());
        var exonEnds = this.getExonEnds(this.getExons());
        var exonLengths = this.getExonLengths();
        var uniformIntronLength = this.getUniformIntronLength();
        var exonStartsWithUniformIntronLength = [];
        var exonEndsWithUniformIntronLength = [];
    
        if (exonCount == 1) {
            return this.getExons();
        }

        // first exon has no introns before it so it retains the same position
        exonStartsWithUniformIntronLength.push(exonStarts[0]);
        exonEndsWithUniformIntronLength.push(exonEnds[0]);
    
        for (var i = 1; i < exonCount; i++) {
            exonStartsWithUniformIntronLength.push(
                exonStartsWithUniformIntronLength[i - 1] 
                + exonLengths[i - 1] + uniformIntronLength
            ); 
            exonEndsWithUniformIntronLength.push(
                exonStartsWithUniformIntronLength[i] + exonLengths[i]
            );
            
        }
        return this.initializeExons(exonStartsWithUniformIntronLength, 
            exonEndsWithUniformIntronLength, exonCount);
    }

    getOffset() {
        return this.getExons()[0].start;
    }

    getIntArrayMinusOffset(intArray, offset) {
        var intArrayMinusOffset = [];
        var length = intArray.length;

        for (var i = 0; i < length; i++) {
            intArrayMinusOffset.push(intArray[i] - offset);
        }
        return intArrayMinusOffset;
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
