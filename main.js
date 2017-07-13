/*jshint esversion: 6 */

const MAX = 10000;

/**
 * Euclidean distance
 */
function eudist(v1,v2) {
	var len = v1.length;
	var sum = 0;

	for(let i=0;i<len;i++) {
		var d = (v1[i]||0) - (v2[i]||0);
		sum += d*d;
	}
	// Square root not really needed
	return sum;	//Math.sqrt(sum);
}

/**
 * Manhattan distance
 */
function mandist(v1,v2) {
	var len = v1.length;
	var sum = 0;

	for(let i=0;i<len;i++) {
		sum += Math.abs((v1[i]||0) - (v2[i]||0));
	}
	return sum;
}

function equals(v1,v2,multi) {
	var l = v1.length;
	for(var i=0;i<l;i++)
		if(v1[i]!=v2[i]) return false;
	return true;
}

/**
 * Inits an array with values
 */
function init(len,val,v) {
	v = v || [];
	for(let i=0;i<len;i++) v[i] = val;
	return v;
}

function skmeans(data,k,initial,maxit) {
	var ks = [], old = [], idxs = [], dist = [];
	var conv = false, it = maxit || MAX;
	var len = data.length, vlen = data[0].length, multi = vlen>0;

	if(!initial) {
		for(let i=0;i<k;i++) {
			ks.push(data[Math.floor(Math.random()*len)]);
		}
	}
	else {
		ks = initial;
	}

	do {
		// For each value in data, find the nearest centroid
		for(let i=0;i<len;i++) {
			let min = Infinity, idx = 0;
			for(let j=0;j<k;j++) {
				// Multidimensional or unidimensional
				var dist = multi? eudist(data[i],ks[j]) : Math.abs(data[i]-ks[j]);
				if(dist<min) {
					min = dist;
					idx = j;
				}
			}
			idxs[i] = idx;
		}

		// Recalculate centroids
		var count = [], sum = [], old = [], dif = 0;
		for(let j=0;j<k;j++) {
			// Multidimensional or unidimensional
			count[j] = 0;
			sum[j] = multi? init(vlen,0,sum[j]) : 0;
			old[j] = ks[j];
		}

		// If multidimensional
		if(multi) {
			for(let j=0;j<k;j++) ks[j] = [];

			// Sum values and count for each centroid
			for(let i=0;i<len;i++) {
				let idx = idxs[i],	// Centroid for that item
					vsum = sum[idx],	// Sum values for this centroid
					vect = data[i];		// Current vector

				// Accumulate value on the centroid for current vector
				for(let h=0;h<vlen;h++) {
					vsum[h] += vect[h];
				}
				count[idx]++;	// Number of values for this centroid
			}
			// Calculate the average for each centroid
			conv = true;
			for(let j=0;j<k;j++) {
				let ksj = ks[j],	// Current centroid
					sumj = sum[j],	// Accumulated centroid values
					oldj = old[j], 	// Old centroid value
					cj = count[j];	// Number of elements for this centrois

				// New average
				for(let h=0;h<vlen;h++) {
					ksj[h] = sumj[h]/cj || 0;	// New centroid
				}
				// Find if centroids have moved
				if(conv) {
					for(let h=0;h<vlen;h++) {
						if(oldj[h]!=ksj[h]) {
							conv = false;
							break;
						}
					}
				}
			}
		}
		// If unidimensional
		else {
			// Sum values and count for each centroid
			for(let i=0;i<len;i++) {
				let idx = idxs[i];
				sum[idx] += data[i];
				count[idx]++;
			}
			// Calculate the average for each centroid
			for(let j=0;j<k;j++) {
				ks[j] = sum[j]/count[j] || 0;	// New centroid
			}
			// Find if centroids have moved
			conv = true;
			for(let j=0;j<k;j++) {
				if(old[j]!=ks[j]) {
					conv = false;
					break;
				}
			}
		}

		conv = conv || (--it<=0);
	}while(!conv);

	return {
		it : MAX-it,
		k : k,
		idxs : idxs,
		centroids : ks
	};
}

module.exports = skmeans;
