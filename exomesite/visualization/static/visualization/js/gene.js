class Gene {
    constructor(cdsStart, cdsEnd, exonStarts, exonEnds) {
        this.cdsStart = cdsStart;
        this.cdsEnd = cdsEnd;
        this.exons = this.initializeExons(cdsStart, cdsEnd, exonStarts, exonEnds);
    }

    // Handle exceptional case where the first exon starts and ends before cdsStart
    // or the last exon starts and ends after cdsEnd, by excluding those exons
    // For example in SAMD11, start = 861120 and end = 861180, while cdsStart = 861321
    initializeExons(cdsStart, cdsEnd, exonStarts, exonEnds) {
        var exons = [];    
        var length = exonStarts.length;
        for (var i = 0; i < length; i++) {
            if ((exonEnds[i] >= cdsStart) && (exonStarts[i] <= cdsEnd)) {
                exons.push(new Exon(exonStarts[i], exonEnds[i]));
            }
        }
        return exons;
    }

    getExons() {
        return this.exons;
    }

    getExonCount() {
        return this.exons.length;
    }

    getIntrons() {
        var exons = this.getExons();
        var length = this.getExonCount();
        var introns = [];

        // I know that biologically, Introns are different from Exons, 
        // but for prototyping I put them in the same class Exon 
        for (var i = 1; i < length; i++) {
            introns.push(new Exon(exons[i-1].end, exons[i].start));
        }
        return introns;
    }

    getIntronCount() {
        return this.getExonCount() - 1;
    }

    getIntronLengths() {
        var intronLengths = [];
        var introns = this.getIntrons();
        var length = this.getIntronCount();

        for (var i = 0; i < length; i++) {
            intronLengths.push(introns[i].getLength());
        }
        return intronLengths;
    }

    getIntronsWithUniformIntronLength() {
        var introns = this.getIntrons();
        var intronsWithUniformIntronLength = [];
        var length = this.getIntronCount();
        var exonsWithUniformIntronLength = this.getExonsWithUniformIntronLength();
        var uniformIntronLengthOneThird = 
            this.roundToTwoDecimalPlaces(this.getUniformIntronLength() / 3);
        var scaleOriginalIntronsToUniformIntrons 
            = this.getScaleOriginalIntronsToUniformIntrons();

        for (var i = 0; i < length; i++) {
            intronsWithUniformIntronLength.push(
                new Exon(
                    scaleOriginalIntronsToUniformIntrons(introns[i].start), 
                    scaleOriginalIntronsToUniformIntrons(introns[i].end)
                )
            );
        }
        return intronsWithUniformIntronLength;
    }

    getIntronPartitionsWithUniformIntronLength() {
        var intronPartitions = [];
        var introns = this.getIntronsWithUniformIntronLength();
        var length = this.getIntronCount();
        var uniformIntronLengthOneThird = 
            this.roundToTwoDecimalPlaces(this.getUniformIntronLength() / 3);

        for (var i = 0; i < length; i++) {
            intronPartitions.push(
                new Exon(introns[i].start, 
                    introns[i].start + uniformIntronLengthOneThird
            ));
            intronPartitions.push(
                new Exon(introns[i].start + uniformIntronLengthOneThird, 
                    introns[i].end - uniformIntronLengthOneThird
            ));
            intronPartitions.push(
                new Exon(introns[i].end - uniformIntronLengthOneThird, 
                    introns[i].end
            ));
        }
        return intronPartitions;
    }

    // Initially I pass in exonStarts and exonEnds but then use them to 
    // initialize an array of Exon objects in the Gene object. 
    // exonStarts and exonEnds are not stored in the Gene object as variables,
    // but are instead derived from the array of Exon objects. 
    // This means that if I want to get modified values of exonStarts and exonEnds,
    // I have to first create a modified array of Exons and then call 
    // getExonStarts() or getExonEnds()
    getExonStarts(exons) {
        var exonStarts = [];
        var length = exons.length;

        for (var i = 0; i < length; i++) {
            exonStarts.push(exons[i].start);
        }
        return exonStarts;
    }

    getExonEnds(exons) {
        var exonEnds = [];
        var length = exons.length;

        for (var i = 0; i < length; i++) {
            exonEnds.push(exons[i].end);
        }
        return exonEnds;
    }


    doesExonContainCdsStart(exon) {
        // Don't split in the case where exonStart >= cdsStart and everything is coding,
        // or the case where exonEnd < cdsStart and everything is non-coding
        return (exon.start < this.cdsStart && exon.end >= this.cdsStart);
    }
      
      
    doesExonContainCdsEnd(exon) {
        // Don't split in the case where exonEnds[length - 1] <= cdsEnd and everything is coding,
        // or the case where exonStarts[length - 1] > cdsEnd and everything is non-coding 
        return (exon.start <= this.cdsEnd && exon.end > this.cdsEnd);
    }

    // Let i be the index of the exon that contains cdsStart within its domain
    // Let j be the index of the exon that contains cdsEnd within its domain
    // If (cdsStart - exon[i].start) > nonCodingLengthLimit, then we need to change exon[i].start
    // so that (cdsStart - exon[i].start) = 200. Same thing if (exon[j].end - cdsEnd) > 200.
    // Here, (cdsStart - exon[i].start) and (exon[j].end - cdsEnd) are the lengths of the non-coding
    // exon partitions.
    limitNonCodingExonLength(nonCodingLengthLimit) {
        var firstExon = this.getExons()[0];
        var lastExon = this.getExons()[this.getIntronCount()];
        var cdsStart = this.cdsStart;
        var cdsEnd = this.cdsEnd;

        if (this.doesExonContainCdsStart(firstExon)
        && (cdsStart - firstExon.start > nonCodingLengthLimit)) {
            this.exons[0] = new Exon(cdsStart - nonCodingLengthLimit, firstExon.end);
        }

        if (this.doesExonContainCdsEnd(lastExon)
        && (lastExon.end - cdsEnd > nonCodingLengthLimit)) {
            this.exons[this.getIntronCount()] = 
                new Exon(lastExon.start, cdsEnd + nonCodingLengthLimit);
        }
    }

    getExonLengths(exons) {
        var exonLengths = [];
        var length = exons.length;
        for (var i = 0; i < length; i++) {
            exonLengths.push(exons[i].getLength());
        }
        return exonLengths;
    }

    getSumOfExonLengths(exons) {
        var sum = 0;
        var exonLengths = this.getExonLengths(exons);
        var length = exons.length;

        for (var i = 0; i < length; i++) {
            sum += exonLengths[i];
        }
        return sum;
    }

    // sum of all intron lengths will equal to half of the sum of all exon lengths
    getUniformIntronLength() {
        return Math.ceil(this.getSumOfExonLengths(this.getExons()) * 0.5 / this.getIntronCount());
    }

    getSumOfUniformIntronLengths() {
        return this.getUniformIntronLength() * this.getIntronCount();
    }

    getExonsWithUniformIntronLength() {
        var exonCount = this.getExonCount();
        var exons = this.getExons();
        var exonStarts = this.getExonStarts(exons);
        var exonEnds = this.getExonEnds(exons);
        var exonLengths = this.getExonLengths(exons);
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
        return this.initializeExons(this.cdsStart, this.cdsEnd, exonStartsWithUniformIntronLength, 
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

    getSplitIntronIndices(basePairsOutsideExonLimit) {
        var splitIntronIndices = [];
        var threshold = 3 * basePairsOutsideExonLimit;
        var introns = this.getIntrons();
        var length = this.getIntronCount();;

        for (var i = 0; i < length; i++) {
            if (introns[i].getLength() > threshold) {
                splitIntronIndices.push(i);
            }
        }
        return splitIntronIndices;
    }

    // Return an array of values containing the starting point of each exon and intron,
    // where intron have their original lengths that have not been modified into a uniform length.
    // Here, exonStarts[i] = starting point of exon i, and exonEnds[i] = starting point of intron i
    // 
    // Introns with length > (3 * basePairsOutsideExonLimit) will be split into three uneven parts,
    // with most of the variants residing in parts 1 and 3
    // 1. [exonEnds[i], exonEnds[i] + basePairsOutsideExonLimit]
    // 2. [exonEnds[i] + basePairsOutsideExonLimit, exonStarts[i+1] - basePairsOutsideExonLimit]
    // 3. [exonStarts[i+1] - basePairsOutsideExonLimit, exonStarts[i+1]
    getDomain(basePairsOutsideExonLimit) {
        var domain = [];
        var exonStarts = this.getExonStarts(this.getExons());
        var exonEnds = this.getExonEnds(this.getExons());
        var length = this.getExonCount();

        // Instead of searching through entire array of indices each time,
        // reverse and pop them one by one knowing that the pop will correspond
        // to the order of the iteration in the loop - O(N) time vs O(N^2)
        var reverseSplitIntronIndices =
            this.getSplitIntronIndices(basePairsOutsideExonLimit).reverse();
        var currentSplitIntronIndex = reverseSplitIntronIndices.pop();
    
        for (var i = 0; i < length - 1; i++) {
            domain.push(exonStarts[i]);
            domain.push(exonEnds[i]);

            if (currentSplitIntronIndex == i) {
                domain.push(exonEnds[i] + basePairsOutsideExonLimit);
                domain.push(exonStarts[i + 1] - basePairsOutsideExonLimit);
                currentSplitIntronIndex = reverseSplitIntronIndices.pop();
            }
        }
        // last exon does not have a intron after it
        domain.push(exonStarts[length - 1]);
        domain.push(exonEnds[length - 1]);
    
        return domain;
    }

    // Return an array of values containing the starting point of each exon and intron,
    // where introns have the same length.
    // TODO: Theoretically, exonStartsWithUniformIntronLengths[i] = starting point of exon i, 
    // and exonEndsWithUniformIntronLengths[i] = starting point of intron i
    // But I split every intron since it would be extra work to keep track of which introns 
    // are split and which are not.
    // 
    // splitIntronIndices contains indices of original intron lengths that exceeded the
    // basePairsOutsideExonLimit and had to be split into three parts in the domain. 
    // The introns in the corresponding indices in the range array will also be split
    // into three event parts.
    getRange(basePairsOutsideExonLimit) {
        var exonWithUniformIntronLength = this.getExonsWithUniformIntronLength();
        var exonStarts = this.getIntArrayMinusOffset(
            this.getExonStarts(exonWithUniformIntronLength), this.getOffset()
        );
        var exonEnds = this.getIntArrayMinusOffset(
            this.getExonEnds(exonWithUniformIntronLength), this.getOffset()
        );
        var length = this.getExonCount();
        var range = [];
        var uniformIntronLengthOneThird = 
            this.roundToTwoDecimalPlaces(this.getUniformIntronLength() / 3);
        var reverseSplitIntronIndices =
            this.getSplitIntronIndices(basePairsOutsideExonLimit).reverse();
        var currentSplitIntronIndex = reverseSplitIntronIndices.pop();
    
        for (var i = 0; i < length - 1; i++) {
            range.push(exonStarts[i]);

            if (i == currentSplitIntronIndex) {
                range.push(exonEnds[i]);
                range.push(exonEnds[i] + uniformIntronLengthOneThird);
                range.push(exonStarts[i + 1] - uniformIntronLengthOneThird);
                currentSplitIntronIndex = reverseSplitIntronIndices.pop();
            } else {
                range.push(exonEnds[i]);
            }
        }
        // last exon does not have a intron after it
        range.push(exonStarts[length - 1]);
        range.push(exonEnds[length - 1]);
    
        return range;
    }

    getScaleOriginalIntronsToUniformIntrons() {
        return d3.scaleLinear()
            .domain(this.getDomain())
            .range(this.getRange());
    }

    roundToTwoDecimalPlaces(x) {
        return Math.round(x * 100) / 100;
    }

    getNonCodingExonPartitions() {
        // For now, I assume that the first exon and last exon contain
        // non-protein encoding parts - in other words, part of the 
        // first exon starts before cdsStart and part of the last exon
        // starts after cdsEnd. This might not always be the case
        var exons = this.getExons();
        var lastExonIndex = this.getExonCount() - 1;
        var nonCodingExonPartitions = [];

        nonCodingExonPartitions.push(new Exon(exons[0].start, this.cdsStart));
        nonCodingExonPartitions.push(new Exon(this.cdsEnd, exons[lastExonIndex].end));
        return nonCodingExonPartitions;
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
