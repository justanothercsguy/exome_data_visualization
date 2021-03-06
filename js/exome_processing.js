// don't forget about pointers from C
// slice allocates a new array from memory and copies the pointers
// to the objects (shallow copy)
class Gene {
    constructor(cdsStart, cdsEnd, exons) {
      this.cdsStart = cdsStart;
      this.cdsEnd = cdsEnd;
      this.exons = exons.slice();
    }

    getExons() {
        return this.exons;
    }

    setExons(exons) {
        this.exons = exons;
    }

    getOffset() {
        return this.exons[0].start;
    }

    getExonLengths() {
        var length = this.exons.length;
        var exonLengths = [];
        for (let i = 0; i < length; i++) {
            exonLengths.push(this.exons[i].getLength());
        }
        return exonLengths;
    }

    // used for testing purposes on original code
    getExonStarts() {
        var length = this.exons.length;
        var exonStarts = [];
        
        for (let i = 0; i < length; i++) {
            exonStarts.push(this.exons[i].start);
        }
        return exonStarts;
    }

    // used for testing purposes on original code
    getExonEnds() {
        var length = this.exons.length;
        var exonEnds = [];

        for (let i = 0; i < length; i++) {
            exonEnds.push(this.exons[i].end);
        }
        return exonEnds;
    }

    getExonStartsMinusOffset() {
        var length = this.exons.length;
        var exonStarts = [];
        var offset = this.getOffset();

        for (let i = 0; i < length; i++) {
            exonStarts.push(this.exons[i].start - offset);
        }
        return exonStarts;
    }

    getExonEndsMinusOffset() {
        var length = this.exons.length;
        var exonEnds = [];
        var offset = this.getOffset();

        for (let i = 0; i < length; i++) {
            exonEnds.push(this.exons[i].end - offset);
        }
        return exonEnds;
    }

    getNonCodingExonIndices() {
        
    }
}

// PROBLEM: If I give the gene class a length field that is calculated
// 1) every time the setter is called to modify the start or end position
// 2) every time a new exon object is initialized,
//
// I could bypass the setter and modify exon thus: gene.exon[i].start = 100
// This would prevent length from being updated
// solution is to use a getLength() function that is not a built in field
// to the Exon class, but instead a derived field
class Exon {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }

    getLength() {
        return this.end - this.start;
    }
}


function initializeExons(exonStarts, exonEnds) {
    var exons = [];
    var length = exonStarts.length;

    for (let i = 0; i < length; i++) {
        exons.push( new Exon( exonStarts[i], exonEnds[i] ) );
    }
    return exons;
}


function getGeneWithUniformIntronLength(gene, INTRON_LENGTH) {
    var exonLengths = gene.getExonLengths();
    var firstExon = gene.getExons()[0];
    var length = exonLengths.length;

    var newGene = new Gene(gene.cdsStart, gene.cdsEnd, []);
    newGene.setExons([ new Exon(firstExon.start, firstExon.end) ]);

    for (let i = 1; i < length; i++) {
        var newStart = newGene.exons[i - 1].start + exonLengths[i - 1] + INTRON_LENGTH;
        var newEnd = newStart + exonLengths[i];
        newGene.exons[i] = new Exon(newStart, newEnd);
    }

    return newGene;
}

function getExonPositionsWithUniformIntronLengths(gene, INTRON_LENGTH) {

    // If length = 1, then there is one intron but no introns so 
    // return the original exonStarts and exonEnds.
    var length = gene.exons.length;
    var exonStartsWithUniformIntronLengths = [];
    var exonEndsWithUniformIntronLengths = [];
    var exonStarts = gene.getExonStartsMinusOffset();
    var exonEnds = gene.getExonEndsMinusOffset();
    var exonLengths = gene.getExonLengths();

    if (length == 1) {
        return {
            exonStartsWithUniformIntronLengths: exonStarts,
            exonEndsWithUniformIntronLengths: eonEnds
        };
    }
    // first exon has no introns before it so it retains the same position
    exonStartsWithUniformIntronLengths.push(exonStarts[0]);
    exonEndsWithUniformIntronLengths.push(exonEnds[0]);

    for (var i = 1; i < length; i++) {
        exonStartsWithUniformIntronLengths.push(
            exonStartsWithUniformIntronLengths[i - 1] + exonLengths[i - 1] + INTRON_LENGTH
        );
        exonEndsWithUniformIntronLengths.push(
            exonStartsWithUniformIntronLengths[i] + exonLengths[i]
        );
    }

    return {
        exonStartsWithUniformIntronLengths: exonStartsWithUniformIntronLengths,
        exonEndsWithUniformIntronLengths: exonEndsWithUniformIntronLengths
    };
}

// given an array, return a new array with each of the elements of the first array 
// subtracted by the offset value
function subtractArrayByOffset(array, offset) {
    var offsettedArray = [];
    var length = array.length;

    for (var i = 0; i < length; i++) {
        offsettedArray.push(array[i] - offset);
    }

    return offsettedArray;
}


function subtractValuesOfTwoArrays(array1, array2) {
    var differenceValues = [];
    var length = array1.length;

    if (array1.length > array2.length) {
        length = array2.length;
    }

    for (var i = 0; i < length; i++) {
        differenceValues.push(array1[i] - array2[i]);
    }

    return differenceValues;
}


function variantAnnotationToLollipopColor(annotation) {
    var mapVariantAnnotationToLollipopColor = d3.scaleOrdinal();

    mapVariantAnnotationToLollipopColor.domain(["3' UTR", "5' UTR", "downstream gene",
        "frameshift", "inframe insertion", "intron", "missense", "non coding transcript exon",
        "splice acceptor", "splice donor", "splice region", "stop gained", "stop lost",
        "synonymous"
    ]);

    mapVariantAnnotationToLollipopColor.range(['brown', 'steelblue', 'violet',
        'red', 'darkgoldenrod', 'gray', 'forestgreen', 'sienna',
        'darkkhaki', 'navy', 'magenta', 'turquoise', 'deepskyblue',
        'orange'
    ]);

    var color = mapVariantAnnotationToLollipopColor(annotation);
    if (!color) {
        return 'black';
    }

    return color;
}


function removeExonsBeforeStartPosition(gene) {
    var length = gene.exons.length;
    var newGene = new Gene(gene.cdsStart, gene.cdsEnd, gene.exons);

    for (var i = 0; i < length; i++) {
        if (gene.exons[i].end >= gene.cdsStart) {
            newGene.setExons(gene.exons.slice(i));
            break;
        }
    }
    return newGene;
}


function removeExonsAfterEndPosition(gene) {
    var length = gene.exons.length;
    var newGene = new Gene(gene.cdsStart, gene.cdsEnd, gene.exons);

    for (var i = length - 1; i >= 0; i--) {
        if (gene.exons[i].start <= gene.cdsEnd) {
            newGene.setExons(gene.exons.slice(0, i + 1));
            break;
        }
    }
    return newGene;
}


function doesExonContainCdsStart(exon, cdsStart) {
    // Don't split in the case where exonStart >= cdsStart and everything is coding,
    // or the case where exonEnd < cdsStart and everything is non-coding
    return (exon.start < cdsStart && exon.end >= cdsStart);
}


function doesExonContainCdsEnd(exon, cdsEnd) {
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
function limitNonCodingExonLength(gene, nonCodingLengthLimit) {

    var length = gene.exons.length;
    var firstExon = gene.exons[0];
    var lastExon = gene.exons[length - 1];
    var cdsStart = gene.cdsStart;
    var cdsEnd = gene.cdsEnd;
    var newGene = new Gene(cdsStart, cdsEnd, gene.exons);

    if (doesExonContainCdsStart(firstExon, cdsStart) 
        && (cdsStart - firstExon.start > nonCodingLengthLimit)) 
    {
        newGene.exons[0] = 
            new Exon(cdsStart - nonCodingLengthLimit, firstExon.end);
    }

    if (doesExonContainCdsEnd(lastExon, cdsEnd) 
        && (lastExon.end - cdsEnd > nonCodingLengthLimit)) 
    {
        newGene.exons[length - 1] = 
            new Exon(lastExon.start, cdsEnd + nonCodingLengthLimit);
    }

    return newGene;
}


function splitExonAtCodingStartPosition(codingStartPosition, exonStarts, exonEnds) {
    var exonStartsSplit = exonStarts.slice();
    var exonEndsSplit = exonEnds.slice();
    var nonCodingIndex = null;

    if (doesExonContainCdsStart(exonStarts[0], exonEnds[0], codingStartPosition)) {
        exonStartsSplit.splice(1, 0, codingStartPosition);

        // Why not (startPosition - 1)? This would mess up the length calculation
        // of each exon parition. For example, suppose the original exon goes from 10 to 20,
        // and cdsStart = 15. The length of the exon is (20 - 10) = 10. 
        // Then if we use (startPosition - 1), we would get:
        // exonStarts[0] = 10, exonEnds[0] = 14, exonStarts[1] = 15, exonEnds[1] = 20.
        // Length = (14 - 10) + (20 - 15) = 4 + 5 = 9. This is not the correct length.
        exonEndsSplit.splice(0, 0, codingStartPosition);
        nonCodingIndex = 0;
    }

    return {
        exonStarts: exonStartsSplit,
        exonEnds: exonEndsSplit,
        nonCodingIndex: nonCodingIndex
    };
}


function splitExonAtCodingEndPosition(codingEndPosition, exonStarts, exonEnds) {
    var exonStartsSplit = exonStarts.slice();
    var exonEndsSplit = exonEnds.slice();
    var length = exonStartsSplit.length;
    var nonCodingIndex = null;

    if (doesExonContainCdsEnd(exonStarts[length - 1], exonEnds[length - 1],
            codingEndPosition)) {
        exonEndsSplit.splice(length - 1, 0, codingEndPosition);

        // Why not (endPosition + 1)? This would mess up the length calculation
        // of each exon partition. For example, suppose the original exon goes from
        // 10 to 20, and cdsEnd = 15. The length of the exon is (20 - 10) = 10.
        // Then if we use (endPosition + 1), we would get:
        // exonStarts[0] = 10, exonEnds[0] = 15, exonStarts[1] = 16, exonEnds[1] = 20.
        // Length = (15 - 10) + (20 - 16) = 5 + 4 = 9. This is not the correct length.
        exonStartsSplit.push(codingEndPosition);

        // account for appending endPosition = cdsEnd to exonStartsSplit and exonEndsSplit 
        // by incrementing length
        length = length + 1;
        nonCodingIndex = length - 1;
    }

    return {
        exonStarts: exonStartsSplit,
        exonEnds: exonEndsSplit,
        nonCodingIndex: nonCodingIndex
    };
}


function roundToTwoDecimalPlaces(x) {
    return Math.round(x * 100) / 100;
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
//
// TODO: Should i just make getting domain and range one function, so that I don't have to pass
// in splitIntronIndices to function getRange()?
function getDomain(gene, basePairsOutsideExonLimit) {
    var domain = [];
    var splitIntronIndices = [];
    var threshold = 3 * basePairsOutsideExonLimit;
    var exonStarts = gene.getExonStartsMinusOffset();
    var exonEnds = gene.getExonEndsMinusOffset();
    var length = exonStarts.length;

    for (var i = 0; i < length - 1; i++) {
        domain.push(exonStarts[i]);
        domain.push(exonEnds[i]);

        if (exonStarts[i + 1] - exonEnds[i] > threshold) {
            domain.push(exonEnds[i] + basePairsOutsideExonLimit);
            domain.push(exonStarts[i + 1] - basePairsOutsideExonLimit);
            splitIntronIndices.push(i);
        }
    }
    // last exon does not have a intron after it
    domain.push(exonStarts[length - 1]);
    domain.push(exonEnds[length - 1]);

    return {
        domain: domain,
        splitIntronIndices: splitIntronIndices
    };
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

function getRange(gene_uniform_intron_length, splitIntronIndices, INTRON_LENGTH) {

    var exonStarts = gene_uniform_intron_length.getExonStartsMinusOffset();
    var exonEnds = gene_uniform_intron_length.getExonEndsMinusOffset();
    
    var length = exonStarts.length;
    var INTRON_LENGTH_SPLIT_INTO_THREE = roundToTwoDecimalPlaces(INTRON_LENGTH / 3);

    var range = [];
    var reverseSplitIntronIndices = splitIntronIndices.reverse();
    var currentSplitIntronIndex = reverseSplitIntronIndices.pop();

    for (var i = 0; i < length - 1; i++) {
        range.push(exonStarts[i]);

        if (i == currentSplitIntronIndex) {
            range.push(exonEnds[i]);
            range.push(exonEnds[i] + INTRON_LENGTH_SPLIT_INTO_THREE);
            range.push(exonStarts[i + 1] - INTRON_LENGTH_SPLIT_INTO_THREE);
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

/*
function getRange(exonStartsWithUniformIntronLengths, exonEndsWithUniformIntronLengths,
    splitIntronIndices, INTRON_LENGTH) {

    const length = exonStartsWithUniformIntronLengths.length;
    const INTRON_LENGTH_SPLIT_INTO_THREE = roundToTwoDecimalPlaces(INTRON_LENGTH / 3);
    var range = [];
    var reverseSplitIntronIndices = splitIntronIndices.reverse();
    var currentSplitIntronIndex = reverseSplitIntronIndices.pop();

    for (var i = 0; i < length - 1; i++) {
        range.push(exonStartsWithUniformIntronLengths[i]);

        if (i == currentSplitIntronIndex) {
            range.push(exonEndsWithUniformIntronLengths[i]);
            range.push(exonEndsWithUniformIntronLengths[i] + INTRON_LENGTH_SPLIT_INTO_THREE);
            range.push(exonStartsWithUniformIntronLengths[i + 1] - INTRON_LENGTH_SPLIT_INTO_THREE);
            currentSplitIntronIndex = reverseSplitIntronIndices.pop();
        } else {
            range.push(exonEndsWithUniformIntronLengths[i]);
        }
    }

    // last exon does not have a intron after it
    range.push(exonStartsWithUniformIntronLengths[length - 1]);
    range.push(exonEndsWithUniformIntronLengths[length - 1]);

    return range;
}
*/
// Given a dictionary of arrays, each containing variants located in the same base pair position,
// return the length of the longest array
function getMaxArrayLengthInDictionary(dictionary) {
    var max = 0;

    for (const [key, value] of Object.entries(dictionary)) {
        if (value.length > max) {
            max = value.length;
        }
    }

    return max;
}