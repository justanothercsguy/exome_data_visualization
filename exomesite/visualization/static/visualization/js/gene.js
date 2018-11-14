class Gene {
    constructor(cdsStart, cdsEnd, exonStarts, exonEnds, 
        basePairsOutsideExonLimit, variants, nonCodingLengthLimit) {
        this.cdsStart = cdsStart;
        this.cdsEnd = cdsEnd;
        this.exons = this.initializeExons(cdsStart, cdsEnd, 
            exonStarts, exonEnds, nonCodingLengthLimit);
        this.basePairsOutsideExonLimit = basePairsOutsideExonLimit;
        this.variants = null;
        this.nonCodingExonIndices = null;
        this.nonCodingLengthLimit = nonCodingLengthLimit;
        this.initializeVariants(variants);
        this.initializeNonCodingExonIndices(this.exons, cdsStart, cdsEnd);
    }

    // Handle exceptional case where the first exon starts and ends before cdsStart
    // or the last exon starts and ends after cdsEnd, by excluding those exons
    // For example in SAMD11, start = 861120 and end = 861180, while cdsStart = 861321
    initializeExons(cdsStart, cdsEnd, exonStarts, exonEnds, nonCodingLengthLimit) {
        console.log("initializeExons()");

        var exons = [];    
        var newExons = [];
        var length = exonStarts.length;
        for (var i = 0; i < length; i++) {
            if ((exonEnds[i] >= cdsStart) && (exonStarts[i] <= cdsEnd)) {
                exons.push(new Exon(exonStarts[i], exonEnds[i]));
            }
        }
        newExons = this.limitNonCodingExonLength(
            exons, nonCodingLengthLimit, cdsStart, cdsEnd,);

        console.log(newExons);

        return newExons;
    }

    initializeNonCodingExonIndices(exons, cdsStart, cdsEnd) {
        console.log("initializeNonCodingExonIndices()");

        var length = exons.length;
        var firstExon = exons[0];
        var lastExon = exons[length - 1];
        var nonCodingExonIndices = [];

        if (this.doesExonContainCdsStart(firstExon, cdsStart)) {
            nonCodingExonIndices.push(0);
        }

        if (this.doesExonContainCdsEnd(lastExon, cdsEnd)) {
            nonCodingExonIndices.push(length - 1);
        }

        this.setNonCodingExonIndices(nonCodingExonIndices);
        console.log(this.getNonCodingExonIndices());
    }

    getNonCodingExonIndices() {
        return this.nonCodingExonIndices;
    }

    setNonCodingExonIndices(nonCodingExonIndices) {
        this.nonCodingExonIndices = nonCodingExonIndices;
    }

    getExons() {
        return this.exons;
    }

    getBasePairsOutsideExonLimit() {
        return this.basePairsOutsideExonLimit;
    }

    getVariants() {
        return this.variants;
    }

    setVariants(variants) {
        this.variants = variants;
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
            introns.push(new Exon(exons[i-1].getEnd(), exons[i].getStart()));
        }
        return introns;
    }

    getIntronCount() {
        return this.getExonCount() - 1;
    }

    getIntronLengths() {
        return this.getExonLengths( this.getIntrons() );
    }

    getIntronsWithUniformIntronLength() {
        var introns = this.getIntrons();
        var intronsWithUniformIntronLength = [];
        var length = this.getIntronCount();
        var exonsWithUniformIntronLength = this.getExonsWithUniformIntronLength();
        var uniformIntronLengthOneThird = 
            this.roundToTwoDecimalPlaces(this.getUniformIntronLength() / 3);
        var scaleOriginalIntronsToUniformIntrons = 
            this.getScaleOriginalIntronsToUniformIntrons(this.getBasePairsOutsideExonLimit());

        for (var i = 0; i < length; i++) {
            intronsWithUniformIntronLength.push(
                new Exon(
                    scaleOriginalIntronsToUniformIntrons(introns[i].getStart()), 
                    scaleOriginalIntronsToUniformIntrons(introns[i].getEnd())
                )
            );
        }
        return intronsWithUniformIntronLength;
    }

    getIntronPartitionsWithUniformIntronLength() {
        var intronPartitions = [];
        var introns = this.getIntronsWithUniformIntronLength(
            this.getBasePairsOutsideExonLimit());
        var length = this.getIntronCount();
        var uniformIntronLengthOneThird = 
            this.roundToTwoDecimalPlaces(this.getUniformIntronLength() / 3);

        for (var i = 0; i < length; i++) {
            var start = introns[i].getStart();
            var end = introns[i].getEnd();

            intronPartitions.push(new Exon(start, start + uniformIntronLengthOneThird));
            intronPartitions.push(new Exon(
                start + uniformIntronLengthOneThird, end - uniformIntronLengthOneThird));
            intronPartitions.push(new Exon(end - uniformIntronLengthOneThird, end));
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
            exonStarts.push(exons[i].getStart());
        }
        return exonStarts;
    }

    getExonEnds(exons) {
        var exonEnds = [];
        var length = exons.length;

        for (var i = 0; i < length; i++) {
            exonEnds.push(exons[i].getEnd());
        }
        return exonEnds;
    }

    doesExonContainCdsStart(exon, cdsStart) {
        // Don't split in the case where exonStart >= cdsStart and everything is coding,
        // or the case where exonEnd < cdsStart and everything is non-coding
        return (exon.getStart() < cdsStart && exon.getEnd() >= cdsStart);
    }      
      
    doesExonContainCdsEnd(exon, cdsEnd) {
        // Don't split in the case where exonEnds[length - 1] <= cdsEnd and everything is coding,
        // or the case where exonStarts[length - 1] > cdsEnd and everything is non-coding 
        return (exon.getStart() <= cdsEnd && exon.getEnd() > cdsEnd);
    }

    // Let i be the index of the exon that contains cdsStart within its domain
    // Let j be the index of the exon that contains cdsEnd within its domain
    // If (cdsStart - exon[i].start) > nonCodingLengthLimit, then we need to change exon[i].start
    // so that (cdsStart - exon[i].start) = 200. Same thing if (exon[j].end - cdsEnd) > 200.
    // Here, (cdsStart - exon[i].start) and (exon[j].end - cdsEnd) are the lengths of the non-coding
    // exon partitions.
    limitNonCodingExonLength(exons, nonCodingLengthLimit, cdsStart, cdsEnd) {
        var length = exons.length;
        var firstExon = exons[0];
        var lastExon = exons[length-1];
        var newExons = [];

        for (var i = 0; i < length; i++) {
            newExons.push(exons[i]);
        }

        if (this.doesExonContainCdsStart(firstExon, cdsStart)
        && (cdsStart - firstExon.getStart() > nonCodingLengthLimit)) {
            newExons[0] = new Exon(cdsStart - nonCodingLengthLimit, firstExon.getEnd());
        }

        if (this.doesExonContainCdsEnd(lastExon, cdsEnd)
        && (lastExon.getEnd() - cdsEnd > nonCodingLengthLimit)) {
            newExons[length - 1] = 
                new Exon(lastExon.getStart(), cdsEnd + nonCodingLengthLimit);
        }

        return newExons;
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
        var firstExon = exons[0];
        var exonLengths = this.getExonLengths(exons);
        var uniformIntronLength = this.getUniformIntronLength();
        var exonStartsWithUniformIntronLength = [];
        var exonEndsWithUniformIntronLength = [];
        var exonsWithUniformIntronLength = [];

        // there is a possible case where exonCount == 0  
        // due to a bad entry in the database - that should be 
        // handled in the Django backend layer though
        if (exonCount == 1) {
            return this.getExons();
        }

        // first exon has no introns before it so it retains the same position
        // regardless of original intron length shifting to uniform intron length
        exonStartsWithUniformIntronLength.push(firstExon.getStart());
        exonEndsWithUniformIntronLength.push(firstExon.getEnd());
        exonsWithUniformIntronLength.push(firstExon);
    
        for (var i = 1; i < exonCount; i++) {
            exonStartsWithUniformIntronLength.push(
                exonStartsWithUniformIntronLength[i - 1] 
                + exonLengths[i - 1] + uniformIntronLength
            ); 
            exonEndsWithUniformIntronLength.push(
                exonStartsWithUniformIntronLength[i] + exonLengths[i]
            );
            exonsWithUniformIntronLength.push(new Exon(
                exonStartsWithUniformIntronLength[i], 
                exonEndsWithUniformIntronLength[i]
            ));
        }
        return exonsWithUniformIntronLength;
    }

    getOffset() {
        return this.getExons()[0].getStart();
    }

    getIntArrayMinusOffset(intArray, offset) {
        var intArrayMinusOffset = [];
        var length = intArray.length;

        for (var i = 0; i < length; i++) {
            intArrayMinusOffset.push(intArray[i] - offset);
        }
        return intArrayMinusOffset;
    }

    getSplitIntronIndices() {
        var splitIntronIndices = [];
        var threshold = 3 * this.getBasePairsOutsideExonLimit();
        var introns = this.getIntrons();
        var intronLengths = this.getIntronLengths() 
        var length = this.getIntronCount();;

        for (var i = 0; i < length; i++) {
            if (intronLengths[i] > threshold) {
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
    getDomain() {
        var domain = [];
        var exonStarts = this.getExonStarts(this.getExons());
        var exonEnds = this.getExonEnds(this.getExons());
        var length = this.getExonCount();
        var basePairsOutsideExonLimit = this.getBasePairsOutsideExonLimit();

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
    getRange() {
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
            this.getSplitIntronIndices(this.getBasePairsOutsideExonLimit()).reverse();
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

        nonCodingExonPartitions.push(new Exon(exons[0].getStart(), this.cdsStart));
        nonCodingExonPartitions.push(new Exon(this.cdsEnd, exons[lastExonIndex].getEnd()));
        return nonCodingExonPartitions;
    }

    // initializeVariants() has to be called after limitNonCodingLength() is called.
    // This makes me wonder if I should pass in nonCodingLengthLimit to the 
    // Gene constructor and call limitNonCodingLength as a part of initializeExons().
    // I am also not sure if I should make a Variant class, seeing I already have 
    // a Variant class in exomesite/visualization/models.py 
    initializeVariants(variants) {
        console.log("initializeVariants()");
        
        var variantsFiltered = null;
        var exons = this.getExons();
        var lowerBound = exons[0].getStart();
        var upperBound = exons[exons.length - 1].getEnd();
        var length = 0;
        var variantList = [];

        variantsFiltered = variants.filter(function(d) {
          if (d.fields.position >= lowerBound && d.fields.position <= upperBound) {
            return true;
          }
          return false;
        });

        length = variantsFiltered.length;
        for (var i = 0; i < length; i++) {
            variantList.push(variantsFiltered[i].fields);   
        }

        this.setVariants(variantList);
    }

    // sometimes there are multiple variants in the same base pair position
    // return a map object where key = position and value = array of variants
    getVariantMap() {
        var variants = this.getVariants();
        var map = {};

        variants.forEach(function(variant) {
            var position = variant.position;
            if (!map[position]) {
                map[position] = [variant];
            }
            else {
                map[position].push(variant);
            }
        });
        return map;
    }
}

class Exon {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    getStart() {
        return this.start;
    }

    getEnd() {
        return this.end;
    }

    getLength() {
        return this.end - this.start;
    }
}
