
/**
* Automatically gets called when applet has loaded.
*/
function qzReady() {
	// Setup our global qz object
	window["qz"] = document.getElementById('qz');
	var title = document.getElementById("title");
	if (qz) {
		try {
			title.innerHTML = title.innerHTML + " " + qz.getVersion();
			document.getElementById("content").style.background = "#F0F0F0";
		} catch(err) { // LiveConnect error, display a detailed meesage
			document.getElementById("content").style.background = "#F5A9A9";
			// alert("ERROR:  \nThe applet did not load correctly.  Communication to the " + 
			// 	"applet has failed, likely caused by Java Security Settings.  \n\n" + 
			// 	"CAUSE:  \nJava 7 update 25 and higher block LiveConnect calls " + 
			// 	"once Oracle has marked that version as outdated, which " + 
			// 	"is likely the cause.  \n\nSOLUTION:  \n  1. Update Java to the latest " + 
			// 	"Java version \n          (or)\n  2. Lower the security " + 
			// 	"settings from the Java Control Panel.");
	  }
  }
}

/**
* Returns whether or not the applet is not ready to print.
* Displays an alert if not ready.
*/
function notReady() {
	// If applet is not loaded, display an error
	if (!isLoaded()) {
		return true;
	}
	// If a printer hasn't been selected, display a message.
	else if (!qz.getPrinter()) {
		alert('Hubungkan printer terlebih dahulu.');
		return true;
	}
	return false;
}

/**
* Returns is the applet is not loaded properly
*/
function isLoaded() {
	if (!qz) {
		alert('Error:\n\n\tPrint plugin is NOT loaded!');
		return false;
	} else {
		try {
			if (!qz.isActive()) {
				alert('Error:\n\n\tPrint plugin is loaded but NOT active!');
				return false;
			}
		} catch (err) {
			alert('Error:\n\n\tPrint plugin is NOT loaded properly!');
			return false;
		}
	}
	return true;
}

/**
* Automatically gets called when "qz.print()" is finished.
*/
function qzDonePrinting() {
	// Alert error, if any
	if (qz.getException()) {
		alert('Error printing:\n\n\t' + qz.getException().getLocalizedMessage());
		qz.clearException();
		return; 
	}
	
	// Alert success message
	// alert('Successfully sent print data to "' + qz.getPrinter() + '" queue.');
}

/***************************************************************************
* Prototype function for finding the "default printer" on the system
* Usage:
*    qz.findPrinter();
*    window['qzDoneFinding'] = function() { alert(qz.getPrinter()); };
***************************************************************************/
function useDefaultPrinter() {
	if (isLoaded()) {
		// Searches for default printer
		qz.findPrinter();
		
		// Automatically gets called when "qz.findPrinter()" is finished.
		window['qzDoneFinding'] = function() {
			// Alert the printer name to user
			var printer = qz.getPrinter();
			alert(printer !== null ? 'Default printer found: "' + printer + '"':
				'Default printer ' + 'not found');
			
			// Remove reference to this function
			window['qzDoneFinding'] = null;
		};
	}
}


/***************************************************************************
* Prototype function for finding the closest match to a printer name.
* Usage:
*    qz.findPrinter('zebra');
*    window['qzDoneFinding'] = function() { alert(qz.getPrinter()); };
***************************************************************************/
function findPrinter(name) {
	// Get printer name from input box
	var p = document.getElementById('printer');
	if (name) {
		p.value = name;
	}
	
	if (isLoaded()) {
		// Searches for locally installed printer with specified name
		qz.findPrinter(p.value);
		
		// Automatically gets called when "qz.findPrinter()" is finished.
		window['qzDoneFinding'] = function() {
			var p = document.getElementById('printer');
			var printer = qz.getPrinter();
			
			// Alert the printer name to user
			alert(printer !== null ? 'Printer found: "' + printer + 
				'" after searching for "' + p.value + '"' : 'Printer "' + 
				p.value + '" not found.');
			document.getElementById('print-button').disabled = false;
			
			// Remove reference to this function
			window['qzDoneFinding'] = null;
		};
	}
}

/***************************************************************************
* Prototype function for listing all printers attached to the system
* Usage:
*    qz.findPrinter('\\{dummy_text\\}');
*    window['qzDoneFinding'] = function() { alert(qz.getPrinters()); };
***************************************************************************/
function findPrinters() {
	if (isLoaded()) {
		// Searches for a locally installed printer with a bogus name
		qz.findPrinter('\\{bogus_printer\\}');
		
		// Automatically gets called when "qz.findPrinter()" is finished.
		window['qzDoneFinding'] = function() {
			// Get the CSV listing of attached printers
			var printers = qz.getPrinters().split(',');
			for (i in printers) {
				alert(printers[i] ? printers[i] : 'Unknown');      
			}
			
			// Remove reference to this function
			window['qzDoneFinding'] = null;
		};
	}
}

/***************************************************************************
* Prototype function for printing a text or binary file containing raw 
* print commands.
* Usage:
*    qz.appendFile('/path/to/file.txt');
*    window['qzDoneAppending'] = function() { qz.print(); };
***************************************************************************/ 
function printFile(file) {
	if (notReady()) { return; }
	
	// Append raw or binary text file containing raw print commands
	qz.appendFile(getPath() + "misc/" + file);
	
	// Automatically gets called when "qz.appendFile()" is finished.
	window['qzDoneAppending'] = function() {
		// Tell the applet to print.
		qz.print();
		
		// Remove reference to this function
		window['qzDoneAppending'] = null;
	};
}

/***************************************************************************
* Prototype function for printing raw ZPL commands
* Usage:
*    qz.append('^XA\n^FO50,50^ADN,36,20^FDHello World!\n^FS\n^XZ\n');
*    qz.print();
***************************************************************************/     
function printZPL() {
	if (notReady()) { return; }
	 
	// Send characters/raw commands to qz using "append"
	// This example is for ZPL.  Please adapt to your printer language
	// Hint:  Carriage Return = \r, New Line = \n, Escape Double Quotes= \"
	qz.append('^XA\n');
    qz.append('^FO50,50^ADN,36,20^FDPRINTED USING QZ PRINT PLUGIN ' + qz.getVersion() + '\n');
	qz.appendImage(getPath() + 'img/image_sample_bw.png', 'ZPLII');
			
	// Automatically gets called when "qz.appendImage()" is finished.
	window['qzDoneAppending'] = function() {
		// Append the rest of our commands
		qz.append('^FS\n');
		qz.append('^XZ\n');  
		
		// Tell the apple to print.
		qz.print();
		
		// Remove any reference to this function
		window['qzDoneAppending'] = null;
	};
}

function print() {
	if (notReady()) { return; }
	 
	var content = document.getElementById('text').value;

	// Send characters/raw commands to qz using "append"
	// This example is for ZPL.  Please adapt to your printer language
	// Hint:  Carriage Return = \r, New Line = \n, Escape Double Quotes= \"
	qz.append(content);
	
	qz.setEndOfDocument('P1,1\r\n');
	qz.setDocumentsPerSpool("2");

	qz.print();
}

/***************************************************************************
****************************************************************************
* *                          HELPER FUNCTIONS                             **
****************************************************************************
***************************************************************************/


/***************************************************************************
* Gets the current url's path, such as http://site.com/example/dist/
***************************************************************************/
function getPath() {
	var path = window.location.href;
	return path.substring(0, path.lastIndexOf("/")) + "/";
}

/**
* Fixes some html formatting for printing. Only use on text, not on tags!
* Very important!
*   1.  HTML ignores white spaces, this fixes that
*   2.  The right quotation mark breaks PostScript print formatting
*   3.  The hyphen/dash autoflows and breaks formatting  
*/
function fixHTML(html) {
	return html.replace(/ /g, "&nbsp;").replace(/’/g, "'").replace(/-/g,"&#8209;"); 
}

/**
* Equivelant of VisualBasic CHR() function
*/
function chr(i) {
	return String.fromCharCode(i);
}


function getQueryParams(property) {
	// This function is anonymous, is executed immediately and 
	// the return value is assigned to QueryString!
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
		// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
		// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	} 
	return property ? query_string[property] : query_string;
}

angular.module('BarcodePrinter', ['ui.bootstrap'])
.constant('AppConfig', {
})
.controller('MainCtrl', ['$scope', '$rootScope', 'Notification', function($scope, $rootScope, Notification){
	$scope.data = angular.fromJson(decodeURI(getQueryParams('data')));
	$scope.development = getQueryParams('dev') === 'true';
	$scope.printerName = getQueryParams('printer_name') || '';
	$scope.printerLoaded = false;
	$scope.defaultPrinter = true;
	$scope.findingCompleted = true;
	
	function getZPLCode(product, joinStr) {
		var x = 0, y = 2, width = 280, height = 200, maxChar = 25;
		var tpl = [
			'^FX ========= Data ke - {counter} =========',
			'^LH{x},{y}',
			// '^LL1200', Label Length
			
			'^FX Nama Produk',
			'^CFB,10',
			'^FO0,0^FWN^FH^FD{name_1}^FS',
			'^FO0,16^FWN^FH^FD{name_2}^FS',

			'^FX Barcode',
			'^BY1,1,30',
			'^FO0,33^ADN,8,8^FWN^FH^BC^FD{barcode}^FS',
			'^FO200,40^ADN,0,0^FWN^FH^FD{index}^FS',

			'^FX Harga',
			'^CFB,5',
			'^FO0,90^FWN^FH^FD{price}^FS',
			'^FO90,90^FWN^FH^FD{catalog}^FS'
		].join(joinStr ? joinStr : ''); 

		var result = [], counter = 0;
		product.forEach(function(product){
			for (var i=0; i<product.quantity; i++) {

				// Untuk membatasi lebar nama
				var name = [];
				if(product.name.length > maxChar - 1) {
					var a = product.name.split('');
					var b = a.splice(0,maxChar - 1);
					if (b[maxChar - 1] != '') {
						a.unshift(b[maxChar - 1]);
						b[maxChar - 1] = '-';
					}

					var c = a;
					if (a.length>maxChar-1) {
						c = a.splice(0,maxChar-1);
						c[maxChar-1] = c[maxChar-2] = c[maxChar-3] = '.';
					}
					name[0] = b.join('');
					name[1] = c.join('');
				} else {
					name[0] = product.name;
					name[1] = '';
				}

				var price = parseFloat(product.price);

				if (price < 1000) {
					price = price + '-0';
				} else if(price >= 1000 && price < 1000000) {
					price = (price / 1000) + '-3'; 
				} else if(price >= 1000000 && price < 1000000000) { 
					price = (price / 1000000) + '-6'; 
				} else if (price >= 1000000000) {
					price = (price / 1000000000) + '-9'; 
				}

				// Ganti semua variabel
				result.push(tpl.replace(/{x}/,x).replace(/{y}/,y).replace(/{name_1}/,name[0]).replace(/{name_2}/,name[1]).replace(/{barcode}/,product.barcode).replace(/{price}/,price).replace(/{counter}/,counter+1).replace(/{index}/,i+1).replace(/{catalog}/,product.catalog_no || '-'));

				counter++;

				if (counter > 0 && counter % 3 == 0) {
					// y += height;
					x = 0;
				} else {
					// Increament posisi x -> ke kanan
					x += width;
				}
			}
		});

		return result;
	}

	$scope.loadCode = function() {
		$scope.rawText = getZPLCode($scope.data, '\n').join('\n');
	}

	$scope.findPrinter = function() {
	
		if (isLoaded()) {
			var a = Notification.popup('Menghubungkan ke printer "' + ($scope.defaultPrinter ? 'Default' : $scope.printerName) + '", silahkan tunggu..');	
			// Searches for locally installed printer with specified name

			$scope.findingCompleted = false;
			if($scope.defaultPrinter)
				qz.findPrinter();
			else	
				qz.findPrinter($scope.printerName);
			
			// Automatically gets called when "qz.findPrinter()" is finished.
			window['qzDoneFinding'] = function() {
				var printer = qz.getPrinter();
				
				if (printer) {
					if(a) a.dismiss();
					if(timeoutId) clearTimeout(timeoutId);
					Notification.popup('Terhubung ke printer "' + ($scope.defaultPrinter ? 'Default' : $scope.printerName ) + '"', true);
					$scope.$apply(function(){
						$scope.printerLoaded = true;
						$scope.findingCompleted = true;
					});
				} else {
					if(a) a.dismiss();
					if(timeoutId) clearTimeout(timeoutId);
					Notification.popup('Tidak dapat terhubung ke printer "' + ($scope.defaultPrinter ? 'Default' : $scope.printerName)  + '"', true);
					$scope.$apply(function(){
						$scope.findingCompleted = true;
					});
				}
				
				// Remove reference to this function
				window['qzDoneFinding'] = null;
			};


			/**
			 * Timeout 30 Detik
			 */
			var timeoutId = setTimeout(function(){
				window.qzDoneFinding();
			}, 30000);

		}
	};

	$scope.print = 	function() {
		if (notReady()) { return; }
		 
		var content = getZPLCode($scope.data);

		// Send characters/raw commands to qz using "append"
		// This example is for ZPL.  Please adapt to your printer language
		// Hint:  Carriage Return = \r, New Line = \n, Escape Double Quotes= \"

		if ($scope.rawText) {
			qz.append($scope.rawText);
			qz.print();			
		} else if(angular.isArray(content)) {
			var index = 0;
			var timeoutId;
			function printNext() {
				if(timeoutId) clearTimeout(timeoutId);
				if(content.length <= 0) return;
				var processed = content.splice(0,3);
				qz.append('^XA^CF,0,0,0^PR12^MD30^PW800^PON^CI13' + processed.join('') + '^XZ');
				qz.print();			
				// console.log('done printing', index, content[index]);	
				timeoutId = setTimeout(function(){
					printNext();
				}, 3000);

			}
			// Start print
			printNext();
		}
	};
}])
.factory('Notification', ['$modal', '$timeout',
function($modal, $timeout) {

    return {
        popup: function(content, auto, canClose) {
        	canClose = canClose == undefined ? true : canClose;
            var tpl = '<div class="modal-body" style="margin:0 auto;">' + content + '</div>';
            if (!auto && canClose) {
                tpl += '<div class="modal-footer"><button ng-click="cancel()" class="btn btn-flat btn-primary btn-sm">OK</button></div>';
            }
            var modal2 = $modal.open({
                template:tpl,
                backdrop:'static',
                controller:['$scope',
                function($scope) {
                    $scope.cancel = function() {
                        modal2.close('cancel');
                    };
                }],

            });
            if (auto === true) {
                $timeout(function() {
                    modal2.close('cancel');
                }, 2000);
            }
            return modal2;
        },
        error: function(data, status, auto) {
            auto = auto === false ? auto : true;
            if (data.error) {
                var err = '';
                angular.forEach(data.error, function(value, key) {
                    if (key != 'reason') {
                        err += key + ' : ' + value + '<br />';
                    }
                });
                return this.popup(err, auto);
            } else {
                return this.popup('System Error (' + status + ')', auto);
            }
        },
        confirm: function(content, okLabel) {
            if (!okLabel)
                okLabel = 'OK';
            var tpl = '<div class="modal-body" style="margin:0 auto;">' + content + '</div>';
            tpl += '<div class="modal-footer"><button ng-click="cancel()" class="btn btn-flat btn-danger btn-sm">Cancel</button><button ng-click="ok()" class="btn btn-flat btn-success btn-sm">' + okLabel + '</button></div>';
            var modal2 = $modal.open({
                template:tpl,
                backdrop:'static',
                controller:['$scope',
                function($scope) {
                    $scope.ok = function() {
                        modal2.close(true);
                    };
                    $scope.cancel = function() {
                        modal2.dismiss('cancel');
                    };
                }],

            });
            return modal2;
        }
    };

}]);