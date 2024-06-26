import componentFactory from './componentFactory.js'
var pdfjsWrapper = require('./pdfjsWrapper.js').default;
var PDFJS = require('pdfjs-dist-sign/es5/build/pdf.js');

if ( typeof window !== 'undefined' && 'Worker' in window && navigator.appVersion.indexOf('MSIE 10') === -1 ) {

	var PdfjsWorker = require('worker-loader!pdfjs-dist-sign/es5/build/pdf.worker.js');
	PDFJS.GlobalWorkerOptions.workerPort = new PdfjsWorker();
}

var component = componentFactory(pdfjsWrapper(PDFJS));
export default component;