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


function removeExonsBeforeStartPosition(startPosition, exonStarts, exonEnds) {
    var length = exonStarts.length;

    // Exons that end before the startPosition will not be returned. Therefore, 
    // if the first exon has (start < startPosition) and (end >= startPosition),
    // then it will be split into a non-coding part and a coding part.
    for (var i = 0; i < length; i++) {
        if (exonEnds[i] >= startPosition) {
            return {
                exonStarts: exonStarts.slice(i),
                exonEnds: exonEnds.slice(i)
            };
        }
    }

    return {
        exonStarts: exonStarts,
        exonEnds: exonEnds
    };
}


function removeExonsAfterEndPosition(endPosition, exonStarts, exonEnds) {
    var length = exonStarts.length;

    // Exons that start after the endPosition will not be returned. Therefore, 
    // if the last exon has (start <= endPosition) and (end > endPosition),
    // then it will be split into a coding part and a non-coding part.
    for (var i = length - 1; i >= 0; i--) {
        if (exonStarts[i] <= endPosition) {
            return {
                exonStarts: exonStarts.slice(0, i + 1),
                exonEnds: exonEnds.slice(0, i + 1)
            };
        }
    }

    return {
        exonStarts: exonStarts,
        exonEnds: exonEnds
    };
}


function doesExonContainCodingStartPosition(exonStart, exonEnd, codingStartPosition) {
    // Don't split in the case where exonStart >= cdsStart and everything is coding,
    // or the case where exonEnd < cdsStart and everything is non-coding
    return (exonStart < codingStartPosition && exonEnd >= codingStartPosition);
}


function doesExonContainCodingEndPosition(exonStart, exonEnd, codingEndPosition) {
    // Don't split in the case where exonEnds[length - 1] <= cdsEnd and everything is coding,
    // or the case where exonStarts[length - 1] > cdsEnd and everything is non-coding 
    return (exonStart <= codingEndPosition && exonEnd > codingEndPosition);
}


// Let i be the index of the exon that contains cdsStart within its domain
// Let j be the index of the exon that contains cdsEnd within its domain
// If (cdsStart - exonStarts[i]) > nonCodingLengthLimit, then we need to change exonStarts[i]
// so that (cdsStart - exonStarts[i]) = 200. Same thing if (exonEnds[j] - cdsEnd) > 200.
// Here, (cdsStart - exonStarts[i]) and (exonEnds[i] - cdsEnd) are the lengths of the non-coding
// exon partitions.
function limitNonCodingExonLength(codingStartPosition, codingEndPosition,
    exonStarts, exonEnds, nonCodingLengthLimit) {

    var exonStartsReduced = exonStarts.slice();
    var exonEndsReduced = exonEnds.slice();
    var firstIndex = 0;
    var lastIndex = exonStarts.length - 1;

    if (doesExonContainCodingStartPosition(exonStarts[firstIndex], exonEnds[firstIndex],
            codingStartPosition) && (cdsStart - exonStarts[0] > nonCodingLengthLimit)) {
        exonStartsReduced[firstIndex] = cdsStart - nonCodingLengthLimit;
    }

    if (doesExonContainCodingEndPosition(exonStarts[lastIndex], exonEnds[lastIndex], codingEndPosition) && (exonEnds[lastIndex] - cdsEnd > nonCodingLengthLimit)) {
        exonEndsReduced[lastIndex] = cdsEnd + nonCodingLengthLimit;
    }

    return {
        exonStarts: exonStartsReduced,
        exonEnds: exonEndsReduced
    };
}


function splitExonAtCodingStartPosition(codingStartPosition, exonStarts, exonEnds) {
    var exonStartsSplit = exonStarts.slice();
    var exonEndsSplit = exonEnds.slice();
    var nonCodingIndex = null;

    if (doesExonContainCodingStartPosition(exonStarts[0], exonEnds[0], codingStartPosition)) {
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

    if (doesExonContainCodingEndPosition(exonStarts[length - 1], exonEnds[length - 1],
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


function getExonPositionsWithUniformIntronLengths(exonStarts, exonEnds,
    INTRON_LENGTH, exonLengths) {

    // EXON_COUNT is the number of exons, not counting the non-coding exon partitions.
    // If EXON_COUNT = 1, then there are no introns so return the original exonStarts and exonEnds.
    const EXON_COUNT = exonStarts.length;
    if (EXON_COUNT == 1) {
        return {
            exonStartsWithUniformIntronLengths: exonStarts,
            exonEndsWithUniformIntronLengths: exonEnds
        };
    }

    var exonStartsWithUniformIntronLengths = [];
    var exonEndsWithUniformIntronLengths = [];

    for (var i = 0; i < EXON_COUNT; i++) {
        if (i == 0) { // first exon has no introns before it so it retains the same position
            exonStartsWithUniformIntronLengths.push(exonStarts[0]);
            exonEndsWithUniformIntronLengths.push(exonEnds[0]);
        } else {
            exonStartsWithUniformIntronLengths.push(
                exonStartsWithUniformIntronLengths[i - 1] + exonLengths[i - 1] + INTRON_LENGTH);
            exonEndsWithUniformIntronLengths.push(
                exonStartsWithUniformIntronLengths[i] + exonLengths[i]);
        }
    }

    return {
        exonStartsWithUniformIntronLengths: exonStartsWithUniformIntronLengths,
        exonEndsWithUniformIntronLengths: exonEndsWithUniformIntronLengths
    };
}


function roundToTwoDecimalPlaces(x) {
    return Math.round(x * 100) / 100;
}


// Return an array of values containing the starting point of each exon and intron,
// where intron have their original lengths that have not been modified into a uniform length.
// Here, exonStarts[i] = starting point of exon i, and exonEnds[i] = starting point of intron i
// 
// Introns with length > (3 * basePairsOutsideExonLimit) will be split into three uneven parts:
// 1. [exonEnds[i], exonEnds[i] + basePairsOutsideExonLimit]
// 2. [exonEnds[i] + basePairsOutsideExonLimit, exonStarts[i+1] - basePairsOutsideExonLimit]
// 3. [exonStarts[i+1] - basePairsOutsideExonLimit, exonStarts[i+1]
// 
// Of the variants that are within an intron region, almost all are within 100 base pairs away 
// from the start or end point of an exon, so set basePairsOutsideExonLimit = 100.
// Introns with length <= (3 * basePairsOutsideExonLimit) will not be split.
//
// TODO: Should i just make getting domain and range one function, so that I don't have to pass
// in splitIntronIndices to function getRange()?
function getDomain(exonStarts, exonEnds, basePairsOutsideExonLimit) {
    const length = exonStarts.length;
    var domain = [];
    var splitIntronIndices = [];
    var threshold = 3 * basePairsOutsideExonLimit;

    for (var i = 0; i < length - 1; i++) {
        domain.push(exonStarts[i]);

        if (exonStarts[i + 1] - exonEnds[i] > threshold) {
            domain.push(exonEnds[i]);
            domain.push(exonEnds[i] + basePairsOutsideExonLimit);
            domain.push(exonStarts[i + 1] - basePairsOutsideExonLimit);
            splitIntronIndices.push(i);
        } else {
            domain.push(exonEnds[i]);
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