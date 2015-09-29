   /* jshint undef: true, unused: true, strict: false, expr: true, maxlen: 120 */
   /* globals $ */

   var jQCanvas = $('#imageCanvas'),
       jQSubtool = $('#subtool'),
       jQLeftToolBox = $('div.left').hide(),
       canvasW, canvasH,
       //waterMarkURL = 'images/watermark.png',
       colorCanvas = {},
       grayCanvas = {},
       wmCanvas = {},
       visualCanv = {},
       beforeWaterMarkImageData,
       helper = {
           _config: {
               translateX: 0,
               translateY: 0,
               zoomLevel: 1,
               edited: false,
               waterMarkLoaded: false,
               overlayZoomLevel: 0
           }
       },
       tools = {},

       // frequently used methods
       mathPow = Math.pow,
       mathSqrt = Math.sqrt,
       mathRound = Math.round,

       // frequently used texts
       sbClass = 'subtool_group',
       cpClass = 'color-picker',
       bgColorStr = 'background-color',
       rgbsStr = 'rgba(',
       commaStr = ',',
       closeBrac = ')',
       clickStr = 'click',
       mouseMoveStr = 'mousemove',
       checkedStr = 'checked',
       spanStr = 'span',
       selBtnClass = 'buttn_selected',
       tableBtnClass = 'add_table_data_botton_class',
       sliderClass = 'tool-slider',
       btnTextConf = {
           colorPicker: {
               title: 'Click to add color point',
               tolerance: {
                   txt: 'Adjust tolerance:'
               },
               color: {
                   txt: 'Color:'
               },
               toggleView: {
                   'title': 'Show original image',
                   txt: 'Show original image:'
               },
               desatOuter: {
                   'title': 'Discolour other colors',
                   txt: 'Discolor other colors:'
               }
           }
       };


   /* create the canvas elements */

   //visual canvas
   visualCanv.canvasElem = document.getElementById('imageCanvas');
   visualCanv.jQElem = $(visualCanv.canvasElem);
   visualCanv.ctx = visualCanv.canvasElem.getContext('2d');
   visualCanv._helperCanvasElem = document.createElement('canvas');
   visualCanv._helperCtx = visualCanv._helperCanvasElem.getContext('2d');



   //color
   colorCanvas.canvasElem = document.createElement('canvas');
   colorCanvas.jQElem = $(colorCanvas.canvasElem);
   colorCanvas.ctx = colorCanvas.canvasElem.getContext('2d');
   colorCanvas._helperCanvasElem = document.createElement('canvas');
   colorCanvas._helperCtx = colorCanvas._helperCanvasElem.getContext('2d');

   //gray
   grayCanvas.canvasElem = document.createElement('canvas');
   grayCanvas.jQElem = $(grayCanvas.canvasElem);
   grayCanvas.ctx = grayCanvas.canvasElem.getContext('2d');
   grayCanvas._helperCanvasElem = document.createElement('canvas');
   grayCanvas._helperCtx = grayCanvas._helperCanvasElem.getContext('2d');

   //watermark
   wmCanvas.canvasElem = document.createElement('canvas');
   wmCanvas.jQElem = $(wmCanvas.canvasElem);
   wmCanvas.ctx = wmCanvas.canvasElem.getContext('2d');

   // @temp
   //$('div.canvas-holder').append($(visualCanv._helperCanvasElem)).append(colorCanvas.jQElem).append(grayCanvas.jQElem);



   helper.drawColorImg = function() {
       visualCanv.ctx.drawImage(colorCanvas.canvasElem, 0, 0);
       helper.drawWaterMark();
   };
   helper.drawGrayImg = function() {
       visualCanv.ctx.drawImage(grayCanvas.canvasElem, 0, 0);
       helper.drawWaterMark();
   };
   helper.drawWaterMark = function() {
       var config, overlayZoomLevel, width, height;
       if (helper._config.waterMarkLoaded) {
           beforeWaterMarkImageData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           config = helper._config;
           overlayZoomLevel = config.overlayZoomLevel;
           overlayZoomLevel = overlayZoomLevel < 0 ? (1 / (1 - overlayZoomLevel)) : (1 + overlayZoomLevel);
           width = wmCanvas.canvasElem.width * overlayZoomLevel;
           height = wmCanvas.canvasElem.height * overlayZoomLevel;
           visualCanv.ctx.drawImage(wmCanvas.canvasElem, 0, 0, width, height);
       }
   };
   helper.removeWaterMark = function() {
       if (beforeWaterMarkImageData && helper._config.waterMarkLoaded) {
           visualCanv.ctx.putImageData(beforeWaterMarkImageData, 0, 0);
       }
   };

   helper.manipulateGrayCanvas = function() {
       var colorData = colorCanvas.imageData.data,
           grayData = grayCanvas.imageData.data,
           i = 0,
           length = colorData.length;

       for (i = 0; i < length; i += 4) {
           grayData[i + 1] = grayData[i + 2] = grayData[i] = 0.21 * colorData[i] + 0.72 * colorData[i + 1] +
               0.07 * colorData[i + 2];
           grayData[i + 3] = 255;
       }
       grayCanvas.ctx.putImageData(grayCanvas.imageData, 0, 0);
       grayCanvas._helperCtx.putImageData(grayCanvas.imageData, 0, 0);
   };

   helper.loadImage = function(src) {
       if (src) {
           var img = new Image();
           img.onload = function() {

               //deactive previous tool
               helper.deActivateTool();

               // set the canvas size
               canvasW = visualCanv._helperCanvasElem.width = visualCanv.canvasElem.width = img.width;
               canvasH = visualCanv._helperCanvasElem.height = visualCanv.canvasElem.height = img.height;

               visualCanv.ctx.drawImage(img, 0, 0);
               visualCanv._helperCtx.drawImage(img, 0, 0);

               jQLeftToolBox.hide();

               // load the crop tool  
               tools.resize.activate();

               helper._config.waterMarkLoaded = flase;
               helper._config.overlayZoomLevel = 0;

           };
           img.src = src;
       }
   };

   helper.postCrop = function() {
       var t;

       // set the canvas size
       colorCanvas._helperCanvasElem.width = visualCanv._helperCanvasElem.width =
           grayCanvas._helperCanvasElem.width = colorCanvas.canvasElem.width = grayCanvas.canvasElem.width = canvasW;
       colorCanvas._helperCanvasElem.height = visualCanv._helperCanvasElem.height =
           grayCanvas._helperCanvasElem.height = colorCanvas.canvasElem.height = grayCanvas.canvasElem.height = canvasH;

       // draw the color image
       colorCanvas.ctx.drawImage(visualCanv.canvasElem, 0, 0);
       colorCanvas._helperCtx.drawImage(visualCanv.canvasElem, 0, 0);

       // draw the initial helper image
       visualCanv._helperCtx.drawImage(visualCanv.canvasElem, 0, 0);

       //lode initially the color image
       helper.drawColorImg();

       // get the color data
       colorCanvas.imageData = colorCanvas.ctx.getImageData(0, 0, canvasW, canvasH);
       // get the vizCanv data (now blank)
       visualCanv.imageData = visualCanv.ctx.createImageData(canvasW, canvasH);
       // get the gray data (now blank)
       grayCanvas.imageData = grayCanvas.ctx.createImageData(canvasW, canvasH);

       // generate corrosponding gray canvas
       helper.manipulateGrayCanvas();


       jQLeftToolBox.show();
       //reset all tools
       for (t in tools) {
           tools[t] && tools[t].reset && tools[t].reset();
       }
       // create the first restore point
       tools.redoUndo.createRestore();
       // set the image status as non-edited
       helper._config.edited = false;
   };

   helper.loadWaterMark = function(url) {
       if (url) {
           var img = new Image();
           img.onload = function() {
               var width, height, l, index = 0,
                   imgData, minValForWhite = 200;

               width = wmCanvas.canvasElem.width = img.width;
               height = wmCanvas.canvasElem.height = img.height;
               // draw the image
               wmCanvas.ctx.drawImage(img, 0, 0);

               wmCanvas.imageData = wmCanvas.ctx.getImageData(0, 0, width, height);

               // make the white part transparent
               l = width * height * 4;
               imgData = wmCanvas.imageData.data;

               for (index = 0; index < l; index += 4) {
                   if (imgData[index] > minValForWhite && imgData[index + 1] > minValForWhite && imgData[index + 2] >
                       minValForWhite) {
                       imgData[index] = imgData[index + 1] = imgData[index + 2] = imgData[index + 3] = 0.1;
                   }

               }
               wmCanvas.ctx.putImageData(wmCanvas.imageData, 0, 0);
               helper._config.waterMarkLoaded = true;
               helper.drawWaterMark();

           };
           img.src = url;
       }
   };


   helper.addDgarMoveEvent = function(elem, onDragFn, dragStartFn, dragEndFn, removeOnMouseOut, endOnDoc, moveOnDoc) {
       var dragStartX, dragStartY,

           removeAll = function() {
               elem.off('mousedown', startDrag)
                   .off(mouseMoveStr, onDrag)
                   .off('mouseup', endDrag)
                   .off('mouseout', endDrag);
               if (endOnDoc) {
                   $(document).on('mouseup', endDrag);
               }
           },
           endDrag = function(event) {
               dragEndFn && dragEndFn(event);
               if (moveOnDoc) {
                   $(document).off(mouseMoveStr, onDrag);
               } else {
                   elem.off(mouseMoveStr, onDrag);
               }
           },
           startDrag = function(event) {
               dragStartFn && dragStartFn(event);
               dragStartX = event.pageX;
               dragStartY = event.pageY;

               if (removeOnMouseOut) {
                   elem.on('mouseout', endDrag);
               }
               if (endOnDoc) {
                   $(document).on('mouseup', endDrag);
               }
               if (moveOnDoc) {
                   $(document).on(mouseMoveStr, onDrag);
               } else {
                   elem.on(mouseMoveStr, onDrag);
               }
           },
           onDrag = function(e) {
               e.dragX = e.pageX - dragStartX;
               e.dragY = e.pageY - dragStartY;
               onDragFn(e);
           };

       elem.on('mousedown', startDrag)
           .on('mouseup', endDrag);
       return removeAll;
   };

   helper.deActivateTool = function() {
       var actTool = helper._config.activTool;
       actTool && tools[actTool].deActivate && tools[actTool].deActivate();
   };

   helper.syncVirtualCanv = function() {
       var zoomLevel = helper._config.zoomLevel,
           translateX = helper._config.translateX,
           translateY = helper._config.translateY;

       // initially store all work in the virtual canvas
       if (zoomLevel !== 1) {
           visualCanv._helperCtx.scale(1 / zoomLevel, 1 / zoomLevel);
       }
       helper.removeWaterMark();
       visualCanv._helperCtx.drawImage(visualCanv.canvasElem, -translateX * zoomLevel, -translateY * zoomLevel);
       visualCanv._helperCtx.setTransform(1, 0, 0, 1, 0, 0);
       helper.drawWaterMark();
   };

   helper.syncVisualCanv = function() {
       var zoomLevel = helper._config.zoomLevel,
           translateX = helper._config.translateX,
           translateY = helper._config.translateY;


       (zoomLevel > 1) && visualCanv.ctx.scale(zoomLevel, zoomLevel);
       (translateX !== 0 || translateY !== 0) && visualCanv.ctx.translate(translateX, translateY);
       visualCanv.ctx.drawImage(visualCanv._helperCanvasElem, 0, 0);
       visualCanv.ctx.setTransform(1, 0, 0, 1, 0, 0);

       helper.drawWaterMark();
   };

   helper.pickColor = function(e) {
       var offset = jQCanvas.offset(),
           imageData;
       helper.removeWaterMark();
       imageData = visualCanv.ctx.getImageData(mathRound(e.pageX - offset.left), mathRound(e.pageY - offset.top), 1, 1);
       helper.drawWaterMark();
       return imageData.data;
   };


   helper.init = function(jQFileElement) {
       var t;

       // set the local image handler
       jQFileElement && jQFileElement.on('change', function(e) {
           var reader = new FileReader();
           reader.onload = function(event) {
               helper.loadImage(event.target.result);
           };
           reader.readAsDataURL(e.target.files[0]);
       });

       //initialize all tools
       for (t in tools) {
           tools[t] && tools[t].init && tools[t].init();
       }

       // load and make the watermark ready
       //helper.loadWaterMark(waterMarkURL);
       // add the tools click event handler


   };



   // add saturation tool
   tools.saturate = {
       _config: {
           pointer_scale: 4
       },
       reset: function() {
           tools.saturate._config.pointer_scale = 4;
       },
       init: function() {
           var jQSaturate = tools.saturate.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_sat')
               .attr('title', 'Click to add saturation brush').html('&nbsp;'),
               satSlider = $(document.createElement('div')).addClass(sliderClass)
               .attr('title', 'Increase / decrease the pointer size'),
               config = tools.saturate._config;

           config.satToolBox = $(document.createElement('div')).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr))
                   .html('Brush size:')).append(satSlider));

           satSlider.slider({
               min: 1,
               max: 5,
               step: 1,
               value: config.pointer_scale / 4,
               change: function(event, ui) {
                   jQCanvas.removeClass('color-brush-' + config.pointer_scale);
                   config.pointer_scale = (ui.value * 4);
                   jQCanvas.addClass('color-brush-' + config.pointer_scale);
               }
           });
           jQLeftToolBox.prepend(jQSaturate);
           jQSaturate.on(clickStr, function() {
               tools.saturate.activate();
           });
       },
       activate: function() {
           var config = tools.saturate._config;
           // deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'saturate';
           // apend the toolbox
           jQSubtool.append(tools.saturate._config.satToolBox);

           jQCanvas.addClass('color-brush-' + config.pointer_scale);

           tools.saturate.btn.addClass(selBtnClass);

           // apply the drag event if the image is not in original condition
           if (helper._config.edited) {
               tools.saturate._config.deActivateDrag = helper.addDgarMoveEvent(jQCanvas, tools.saturate._applySat,
                   tools.saturate.dragStart, tools.saturate.dragEnd, false, true);
           }

       },
       dragStart: function() {
           tools.saturate._config.dragged = false;
       },
       dragEnd: function() {
           if (tools.saturate._config.dragged) {
               tools.saturate._config.dragged = false;
               tools.redoUndo.createRestore();
           }
       },
       deActivate: function() {
           var config = tools.saturate._config;
           tools.saturate._config.deActivateDrag && tools.saturate._config.deActivateDrag();
           //remove the toolbox
           tools.saturate._config.satToolBox.detach();

           jQCanvas.removeClass('color-brush-' + config.pointer_scale);
           tools.saturate.btn.removeClass(selBtnClass);

       },
       _applySat: function(e) {
           var offset = visualCanv.jQElem.offset(),
               config = tools.saturate._config,
               pointer_scale = config.pointer_scale,
               x = mathRound(e.pageX - offset.left), // - halfSaturationScale,
               y = mathRound(e.pageY - offset.top), // - halfSaturationScale,
               w = pointer_scale,
               h = pointer_scale;
           config.dragged = true;
           helper.removeWaterMark();
           visualCanv.ctx.putImageData(colorCanvas.ctx.getImageData(x, y, w, h), x, y);
           helper.drawWaterMark();
       }
   };


   // add desaturation tool
   tools.deSaturate = {
       _config: {
           pointer_scale: 4
       },
       reset: function() {
           tools.deSaturate._config.pointer_scale = 4;
       },
       init: function() {
           var jQDSaturate = tools.deSaturate.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_desat')
               .attr('title', 'Click to add desaturation brush').html('&nbsp;'),
               deSatSlider = $(document.createElement('div')).addClass(sliderClass).attr('title',
                   'Increase / decrease the pointer size'),
               config = tools.deSaturate._config;

           config.satToolBox = $(document.createElement('div')).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr))
                   .html('Brush size:')).append(deSatSlider));

           deSatSlider.slider({
               min: 1,
               max: 5,
               step: 1,
               value: config.pointer_scale / 4,
               change: function(event, ui) {
                   jQCanvas.removeClass('gray-brush-' + config.pointer_scale);
                   config.pointer_scale = ui.value * 4;
                   jQCanvas.addClass('gray-brush-' + config.pointer_scale);
               }
           });
           jQLeftToolBox.prepend(jQDSaturate);
           jQDSaturate.on(clickStr, function() {
               tools.deSaturate.activate();
           });
       },
       activate: function() {
           var config = tools.deSaturate._config;
           // deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'deSaturate';
           // apend the toolbox
           jQSubtool.append(tools.deSaturate._config.satToolBox);
           jQCanvas.addClass('gray-brush-' + config.pointer_scale);
           // apply the drag event
           tools.deSaturate._config.deActivateDrag = helper.addDgarMoveEvent(jQCanvas, tools.deSaturate._applyDeSat,
               tools.deSaturate.dragStart, tools.deSaturate.dragEnd, false, true);

           tools.deSaturate.btn.addClass(selBtnClass);

       },
       dragStart: function() {
           tools.deSaturate._config.dragged = false;
       },
       dragEnd: function() {
           if (tools.deSaturate._config.dragged) {
               tools.deSaturate._config.dragged = false;
               tools.redoUndo.createRestore();
           }
       },
       deActivate: function() {
           var config = tools.deSaturate._config;
           tools.deSaturate._config.deActivateDrag && tools.deSaturate._config.deActivateDrag();
           //remove the toolbox
           tools.deSaturate._config.satToolBox.detach();
           jQCanvas.removeClass('gray-brush-' + config.pointer_scale);
           tools.deSaturate.btn.removeClass(selBtnClass);
       },
       _applyDeSat: function(e) {
           var offset = visualCanv.jQElem.offset(),
               config = tools.deSaturate._config,
               pointer_scale = config.pointer_scale,
               x = mathRound(e.pageX - offset.left), // - halfSaturationScale,
               y = mathRound(e.pageY - offset.top), // - halfSaturationScale,
               w = pointer_scale,
               h = pointer_scale;
           config.dragged = true;
           helper.removeWaterMark();
           visualCanv.ctx.putImageData(grayCanvas.ctx.getImageData(x, y, w, h), x, y);
           helper.drawWaterMark();
       }
   };


   // add zoom tool
   tools.zoom = {
       _config: {

       },
       reset: function() {
           helper._config.translateX = helper._config.translateY = 0;
           helper._config.zoomLevel = 1;
       },
       init: function() {
           var jQZoom = tools.zoom.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_zoom_drag')
               .attr('title', 'Click for zoom and drag').html('&nbsp;'),
               zoomSlider = $(document.createElement('div')).addClass(sliderClass).attr('title',
                   'Slide to zoom the canvas'),
               config = tools.zoom._config;

           tools.zoom.jQZoomToolBox = $(document.createElement('div')).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr))
                   .html('Zoom level:')).append(zoomSlider));

           zoomSlider.slider({
               min: 1,
               max: 10,
               step: 0.5,
               value: helper._config.zoomLevel,
               change: function(event, ui) {
                   config.timer && clearTimeout(config.timer);
                   config.timer = setTimeout(function() {
                       tools.zoom.zoomCanvas(ui.value);
                   }, 100);
               }
           });
           jQLeftToolBox.prepend(jQZoom);
           // activate zoom
           jQZoom.on(clickStr, function() {
               tools.zoom.activate();
           });

       },
       activate: function() {
           //deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'zoom';

           jQSubtool.append(tools.zoom.jQZoomToolBox);
           jQCanvas.addClass('drag_enabled');
           tools.zoom._config.deActivateDrag = helper.addDgarMoveEvent(jQCanvas, tools.zoom.dragCanvas,
               tools.zoom.dragStartCanvas, tools.zoom.dragEndCanvas, true);

           tools.zoom.btn.addClass(selBtnClass);

           // initially store all work in the virtual canvas
           helper.syncVirtualCanv();

       },
       dragStartCanvas: function() {
           tools.zoom._config.startTransX = helper._config.translateX;
           tools.zoom._config.startTransY = helper._config.translateY;
       },
       dragEndCanvas: function() {

       },
       deActivate: function() {
           helper._config.activTool = '';
           tools.zoom.jQZoomToolBox.detach();
           jQCanvas.removeClass('drag_enabled');
           tools.zoom._config.deActivateDrag();
           tools.zoom.btn.removeClass(selBtnClass);
       },
       _refreshCanvases: function() {
           var zoomLevel = helper._config.zoomLevel,
               maxZoomX = (canvasW - (canvasW * zoomLevel)) / zoomLevel,
               maxZoomY = (canvasH - (canvasH * zoomLevel)) / zoomLevel,
               translateX = helper._config.translateX,
               translateY = helper._config.translateY;

           // Validate the transalation
           translateX = helper._config.translateX = translateX > 0 ? 0 : translateX;
           translateY = helper._config.translateY = translateY > 0 ? 0 : translateY;
           translateX = helper._config.translateX = translateX < maxZoomX ? maxZoomX : translateX;
           translateY = helper._config.translateY = translateY < maxZoomY ? maxZoomY : translateY;

           if (zoomLevel > 1) {

               // apply the transformation
               visualCanv.ctx.scale(zoomLevel, zoomLevel);
               visualCanv.ctx.translate(translateX, translateY);
               colorCanvas.ctx.scale(zoomLevel, zoomLevel);
               colorCanvas.ctx.translate(translateX, translateY);
               grayCanvas.ctx.scale(zoomLevel, zoomLevel);
               grayCanvas.ctx.translate(translateX, translateY);
           }

           // apply zoom in viz canvas and then draw the image
           visualCanv.ctx.drawImage(visualCanv._helperCanvasElem, 0, 0);

           //set the zoom at the gray and color canvas
           colorCanvas.ctx.drawImage(colorCanvas._helperCanvasElem, 0, 0);

           //set the zoom at the gray and color canvas
           grayCanvas.ctx.drawImage(grayCanvas._helperCanvasElem, 0, 0);


           if (zoomLevel > 1) {
               visualCanv.ctx.setTransform(1, 0, 0, 1, 0, 0);
               colorCanvas.ctx.setTransform(1, 0, 0, 1, 0, 0);
               grayCanvas.ctx.setTransform(1, 0, 0, 1, 0, 0);

           }
           helper.drawWaterMark();

       },

       zoomCanvas: function(zoomLevel) {
           if (helper._config.zoomLevel != zoomLevel) {
               helper._config.zoomLevel = zoomLevel;
               tools.zoom._refreshCanvases();
           }
       },
       dragCanvas: function(event) {
           var zoomLevel = helper._config.zoomLevel;
           if (zoomLevel != 1) {
               helper._config.translateX = tools.zoom._config.startTransX + (event.dragX / zoomLevel);
               helper._config.translateY = tools.zoom._config.startTransY + (event.dragY / zoomLevel);

               tools.zoom._refreshCanvases();
           }
       }
   };

   // add redo undo tool

   tools.redoUndo = {
       _config: {
           restorePoints: [],
           currentRPoint: -1,
           maxStore: 10
       },
       reset: function() {
           tools.redoUndo._config.restorePoints = [];
           tools.redoUndo._config.currentRPoint = -1;
           tools.redoUndo._config.maxStore = 10;
       },
       init: function() {
           var reDoBtn = $(document.createElement(spanStr)).addClass(tableBtnClass + ' btn_redo')
               .attr('title', 'Redo').html('&nbsp;').on(clickStr, tools.redoUndo.reDo),
               unDoBtn = $(document.createElement(spanStr)).addClass(tableBtnClass + ' btn_undo')
               .attr('title', 'Undo').html('&nbsp;').on(clickStr, tools.redoUndo.unDo);
           // insert the buttons
           jQLeftToolBox.prepend(reDoBtn).prepend(unDoBtn);

       },
       activate: function() {
           // this should be always active
       },
       deActivate: function() {

       },
       createRestore: function() {
           // first sync the virtual canvas
           helper.syncVirtualCanv();

           var config = tools.redoUndo._config,
               restorePoints = config.restorePoints,
               ImageData = visualCanv._helperCtx.getImageData(0, 0, canvasW, canvasH);

           restorePoints.length = config.currentRPoint + 1;


           restorePoints.push(ImageData);


           // if store exides remove the initial one
           if (restorePoints.length > config.maxStore) {
               restorePoints.shift();
           }
           config.currentRPoint = restorePoints.length - 1;
           tools.redoUndo._configImageEditStatus();
       },
       _configImageEditStatus: function() {
           helper._config.edited = (tools.redoUndo._config.currentRPoint > 0);
       },
       updateLastPoint: function() {
           var config = tools.redoUndo._config,
               restorePoints = config.restorePoints;
           // first sync the virtual canvas
           helper.syncVirtualCanv();
           restorePoints[config.currentRPoint] = visualCanv._helperCtx.getImageData(0, 0, canvasW, canvasH);
       },
       reDo: function() {
           var config = tools.redoUndo._config;

           if (config.currentRPoint < (config.restorePoints.length - 1)) {
               config.currentRPoint += 1;
               tools.redoUndo.updateRPoint(config.currentRPoint);
           }
           tools.redoUndo._configImageEditStatus();
       },
       unDo: function() {
           var config = tools.redoUndo._config;
           if (config.currentRPoint > 0) {
               config.currentRPoint -= 1;
               tools.redoUndo.updateRPoint();
           }
           tools.redoUndo._configImageEditStatus();
       },
       updateRPoint: function() {
           var config = tools.redoUndo._config,
               restorePoints = config.restorePoints;
           visualCanv._helperCtx.putImageData(restorePoints[config.currentRPoint], 0, 0);
           // now sync the virtual canvas
           helper.syncVisualCanv();
       }
   };

   tools.magicWand = {
       _config: {
           tolerance: 20,
           contiguous: true,
           filterType: 0,
           applied: false

       },
       reset: function() {

       },
       init: function() {
           var config = tools.magicWand._config,
               wandSlider = $(document.createElement('div')).addClass(sliderClass).attr('title',
                   'Slide to set tolerance'),
               jQCont = $(document.createElement('input')).prop({
                   'title': 'Enable contuguous areas only',
                   'type': 'checkbox',
                   'checked': config.contiguous ? checkedStr : ''
               }).on(clickStr, function() {
                   config.contiguous = $(this).is(':checked');
                   tools.magicWand.applyMagic();
               }),
               jQSatTool = $(document.createElement(spanStr)).addClass('sub_btn_sat')
               .attr('title', 'Click to desaturate outside area').html('&nbsp;').on(clickStr,
                   tools.magicWand._desatOuter),
               jQDeSatTool = $(document.createElement(spanStr)).addClass('sub_btn_desat')
               .attr('title', 'Click to desaturate selected area').html('&nbsp;').on(clickStr,
                   tools.magicWand._desatInner),
               wandBtn = tools.magicWand.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_magic_wand').attr('title', 'Magic Wand')
               .html('&nbsp;').on(clickStr, tools.magicWand.activate);


           tools.magicWand.jQWandToolBox = $(document.createElement('div')).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr))
                   .html('Tolerance:')).append(wandSlider)).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr)).html('Contiguous:'))
               .append(jQCont)).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr)).html('Desaturate outer area:'))
               .append(jQSatTool)).append($(document.createElement(spanStr))
               .addClass(sbClass).append($(document.createElement(spanStr))
                   .html('Desaturate selected area:')).append(jQDeSatTool));

           wandSlider.slider({
               min: 10,
               max: 100,
               step: 10,
               value: config.tolerance,
               change: function(event, ui) {
                   config.timer && clearTimeout(config.timer);
                   config.timer = setTimeout(function() {
                       config.tolerance = ui.value;
                       tools.magicWand.applyMagic();
                   }, 100);
               }
           });
           jQLeftToolBox.prepend(wandBtn);
       },
       activate: function() {
           var config = tools.magicWand._config;
           //deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'magicWand';

           jQSubtool.append(tools.magicWand.jQWandToolBox);
           jQCanvas.addClass('wand_enabled').on(clickStr, tools.magicWand.wandClick);

           config.filterType = 0;
           config.applied = false;


           tools.magicWand.btn.addClass(selBtnClass);
           helper.removeWaterMark();
           config.oriImageData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           config.imageColorBorderData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           config.imageGrayBorderData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           helper.drawWaterMark();
       },
       deActivate: function() {
           helper._config.activTool = '';
           tools.magicWand.jQWandToolBox.detach();
           jQCanvas.removeClass('wand_enabled').off(clickStr, tools.magicWand.wandClick);
           tools.magicWand._endBorderAnim();
           tools.magicWand.btn.removeClass(selBtnClass);
       },
       wandClick: function(e) {
           var config = tools.magicWand._config,
               offset = jQCanvas.offset(),
               oriImageData = config.oriImageData.data,
               posX = config.posX = mathRound(e.pageX - offset.left),
               posY = config.posY = mathRound(e.pageY - offset.top),
               pos = (posY * canvasW + posX) * 4;

           config.colorData = [oriImageData[pos], oriImageData[pos + 1], oriImageData[pos + 2], oriImageData[pos + 3]];

           tools.magicWand.applyMagic();
       },
       applyMagic: function() {
           var config = tools.magicWand._config;
           if (!config.colorData) {
               return;
           }
           tools.magicWand._updateImageData();


           if (config.contiguous) {
               tools.magicWand._createSingleCluster(config.posX, config.posY);
           } else {
               tools.magicWand._createClusters();
           }
           if (config.filterType) {
               if (config.filterType === 1) {
                   tools.magicWand._desatInner();
               } else {
                   tools.magicWand._desatOuter();
               }
           } else {
               tools.magicWand._startBorderAnim();
           }

       },
       _updateImageData: function() {
           var config = tools.magicWand._config,
               oriImageData = config.oriImageData.data,
               imageData = config.imageColorBorderData.data,
               grayData = config.imageGrayBorderData.data,
               i, l = canvasW * canvasH,
               index1 = 0;

           config.filterArr = [];
           config.filterArr.length = l;

           for (i = 0; i < l; i += 1, index1 += 4) {
               imageData[index1] = grayData[index1] = oriImageData[index1];
               imageData[index1 + 1] = grayData[index1 + 1] = oriImageData[index1 + 1];
               imageData[index1 + 2] = grayData[index1 + 2] = oriImageData[index1 + 2];
           }
       },
       _createSingleCluster: function(px, py) {
           var config = tools.magicWand._config,
               filterArr = config.filterArr,
               oriImageData = config.oriImageData.data,
               imageData = config.imageColorBorderData.data,
               grayData = config.imageGrayBorderData.data,
               tolerance = config.tolerance,
               pointerStore = [
                   [px, py]
               ],
               point,
               x1, y1, x2, y2, x, y, i, j,
               r = config.colorData[0],
               g = config.colorData[1],
               b = config.colorData[2],
               w1 = canvasW - 1,
               h1 = canvasH - 1,
               //width4 = canvasW * 4,
               index1, index2;



           filterArr[py * canvasW + px] === 1;

           while (pointerStore.length) {
               point = pointerStore.shift();
               x = point[0];
               y = point[1];
               x1 = x > 0 ? x - 1 : x;
               y1 = y > 0 ? y - 1 : y;
               x2 = x < w1 ? x + 1 : x;
               y2 = y < h1 ? y + 1 : y;

               for (j = y1; j <= y2; j += 1) {
                   for (i = x1, index1 = j * canvasW + i, index2 = index1 * 4; i <= x2; i += 1, index1 += 1,
                       index2 += 4) {

                       if (!filterArr[index1] && (i != x || j != y)) {
                           if (mathSqrt(mathPow(oriImageData[index2] - r, 2) + mathPow(oriImageData[index2 + 1] - g,
                                   2) + mathPow(oriImageData[index2 + 2] - b, 2)) <= tolerance) { // inside
                               pointerStore.push([i, j]);
                               filterArr[index1] = 1;
                               // @temp
                               // grayData[index2] = grayData[index2 + 1] = grayData[index2 + 2] =
                               //     imageData[index2] = imageData[index2 + 1] = imageData[index2 + 2] = 150;
                           } else { // border
                               filterArr[index1] = 3;
                               grayData[index2] = grayData[index2 + 1] = grayData[index2 + 2] = 0;
                               imageData[index2] = imageData[index2 + 1] = imageData[index2 + 2] = 255;
                           }
                       }
                   }
               }



           }
       },
       _createClusters: function() {
           var config = tools.magicWand._config,
               filterArr = config.filterArr,
               oriImageData = config.oriImageData.data,
               imageData = config.imageColorBorderData.data,
               grayData = config.imageGrayBorderData.data,
               tolerance = config.tolerance,
               r = config.colorData[0],
               g = config.colorData[1],
               b = config.colorData[2],
               dataIndex = 0,
               x = 0,
               y = 0,
               index = 0,
               canvasW1 = canvasW - 1,
               width4t = canvasW * 4,
               index1,
               index2;
           for (y = 0; y < canvasH; y += 1) {
               for (x = 0; x < canvasW; x += 1, dataIndex += 4, index += 1) {

                   if (mathSqrt(mathPow(oriImageData[dataIndex] - r, 2) + mathPow(oriImageData[dataIndex + 1] - g, 2) +
                           mathPow(oriImageData[dataIndex + 2] - b, 2)) <= tolerance) {
                       filterArr[index] = 1; //same color

                       // @temp
                       // imageData[dataIndex] = grayData[dataIndex] = //oriImageData[dataIndex];
                       // imageData[dataIndex + 1] = grayData[dataIndex + 1] = //oriImageData[dataIndex + 1];
                       // imageData[dataIndex + 2] = grayData[dataIndex + 2] = 150; //oriImageData[dataIndex + 2];

                       // check boreders
                       if (y > 0) {
                           index1 = index - canvasW;
                           index2 = dataIndex - width4t;

                           if (filterArr[index1] === 2) {
                               filterArr[index1] === 3; // 3 means already marked as border
                               grayData[index2] = grayData[index2 + 1] = grayData[index2 + 2] = 0;
                               imageData[index2] = imageData[index2 + 1] = imageData[index2 + 2] = 255;
                           }

                           if (x > 0) {
                               index1 -= 1;
                               if (filterArr[index1] === 2) {
                                   filterArr[index1] === 3;
                                   grayData[index2 - 4] = grayData[index2 - 3] = grayData[index2 - 2] = 0;
                                   imageData[index2 - 4] = imageData[index2 - 3] = imageData[index2 - 2] = 255;
                               }
                           }
                           if (x < canvasW1) {
                               index1 += 2;
                               if (filterArr[index1] === 2) {
                                   filterArr[index1] === 3;
                                   grayData[index2 + 4] = grayData[index2 + 5] = grayData[index2 + 5] = 0;
                                   imageData[index2 + 4] = imageData[index2 + 5] = imageData[index2 + 5] = 255;
                               }
                           }
                       }

                       if (x > 0) {
                           index1 = index - 1;
                           index2 = index - 4;
                           if (filterArr[index1] === 2) {
                               filterArr[index1] === 3;
                               grayData[index2] = grayData[index2 + 1] = grayData[index2 + 2] = 0;
                               imageData[index2] = imageData[index2 + 1] = imageData[index2 + 2] = 255;
                           }
                       }

                   } else {
                       // check boreders
                       index1 = index - canvasW;

                       if (
                           ((y > 0) && (
                               (filterArr[index1] === 1) ||
                               (x > 0 && filterArr[index1 - 1] === 1) ||
                               (x < canvasW1 && filterArr[index1 + 1] === 1)
                           )) ||
                           (x > 0 && filterArr[index - 1] === 1)
                       ) {



                           filterArr[index] === 3;
                           grayData[dataIndex] = grayData[dataIndex + 1] = grayData[dataIndex + 2] = 0;
                           imageData[dataIndex] = imageData[dataIndex + 1] = imageData[dataIndex + 2] = 255;
                       } else {
                           filterArr[index] = 2; //different color
                           imageData[dataIndex] = grayData[dataIndex] = oriImageData[dataIndex];
                           imageData[dataIndex + 1] = grayData[dataIndex + 1] = oriImageData[dataIndex + 1];
                           imageData[dataIndex + 2] = grayData[dataIndex + 2] = oriImageData[dataIndex + 2];
                       }
                   }
               }
           }

       },
       _startBorderAnim: function() {
           var config = tools.magicWand._config;
           config.boolInterVal = true;

           tools.magicWand._endBorderAnim();

           config.animInterval = setInterval(function() {
               visualCanv.ctx.putImageData(config.boolInterVal ? config.imageColorBorderData :
                   config.imageGrayBorderData, 0, 0);
               helper.drawWaterMark();
               config.boolInterVal = !config.boolInterVal;
           }, 200);
       },
       _endBorderAnim: function() {
           var config = tools.magicWand._config;
           clearInterval(tools.magicWand._config.animInterval);
           if (!config.applied) {
               visualCanv.ctx.putImageData(config.oriImageData, 0, 0);
               helper.drawWaterMark();
           }
       },
       _desatOuter: function() {
           var config = tools.magicWand._config,
               oriImageData = config.oriImageData.data,
               imageData = config.imageColorBorderData.data,
               i, l = canvasW * canvasH,
               index1 = 0,
               filterArr = config.filterArr;

           tools.magicWand._endBorderAnim();

           config.filterType = 2;

           for (i = 0; i < l; i += 1, index1 += 4) {
               if (filterArr[i] === 1) {
                   imageData[index1] = oriImageData[index1];
                   imageData[index1 + 1] = oriImageData[index1 + 1];
                   imageData[index1 + 2] = oriImageData[index1 + 2];
               } else {
                   imageData[index1] = imageData[index1 + 1] = imageData[index1 + 2] = 0.21 * oriImageData[index1] +
                       0.72 * oriImageData[index1 + 1] + 0.07 * oriImageData[index1 + 2];
               }
           }
           visualCanv.ctx.putImageData(config.imageColorBorderData, 0, 0);
           helper.drawWaterMark();
           if (config.applied) {
               tools.redoUndo.updateLastPoint();
           } else {
               config.applied = true;
               tools.redoUndo.createRestore();
           }
       },
       _desatInner: function() {
           var config = tools.magicWand._config,
               oriImageData = config.oriImageData.data,
               imageData = config.imageColorBorderData.data,
               i, l = canvasW * canvasH,
               index1 = 0,
               filterArr = config.filterArr;

           tools.magicWand._endBorderAnim();

           config.filterType = 1;

           for (i = 0; i < l; i += 1, index1 += 4) {
               if (filterArr[i] === 1) {
                   imageData[index1] = imageData[index1 + 1] = imageData[index1 + 2] = 0.21 * oriImageData[index1] +
                       0.72 * oriImageData[index1 + 1] + 0.07 * oriImageData[index1 + 2];
               } else {
                   imageData[index1] = oriImageData[index1];
                   imageData[index1 + 1] = oriImageData[index1 + 1];
                   imageData[index1 + 2] = oriImageData[index1 + 2];
               }
           }

           visualCanv.ctx.putImageData(config.imageColorBorderData, 0, 0);
           helper.drawWaterMark();
           if (config.applied) {
               tools.redoUndo.updateLastPoint();
           } else {
               config.applied = true;
               tools.redoUndo.createRestore();
           }
       }
   };

   tools.colorPicker = {
       _config: {
           cpCount: 0,
           sliderPos: 0.7,
           tolerance: 49,
           lastStoredCP: -1,
           colorSelected: false,
           showOriginal: false,
           disColorOuter: true,
       },
       reset: function() {

       },
       init: function() {
           var config = tools.colorPicker._config,
               textConf = btnTextConf.colorPicker,
               newCPGroup = $(document.createElement(spanStr)).addClass(sbClass)
               .append($(document.createElement(spanStr)).html('Pick another color:'))
               .append($(document.createElement(spanStr)).addClass('sub_btn__new_color_picker').html('+')
                   .attr('title', 'Click to pick another color').on(clickStr, tools.colorPicker.newCP)),
               delElemGroup = $(document.createElement(spanStr)).addClass(sbClass).append(
                   $(document.createElement(spanStr)).html('Replace selected color:'))
               .append($(document.createElement(spanStr)).html('&ndash;').addClass('del_cp_botton_class')
                   .on(clickStr, tools.colorPicker.deleteCP)),
               jQSlider = $(document.createElement(spanStr)).addClass(sliderClass),
               jQCPSpan = tools.colorPicker.jQCPSpan = $(document.createElement(spanStr)).html('&nbsp;&nbsp;')
               .addClass('add_cp_botton_class'),
               cpBtn = tools.colorPicker.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_color_picker').attr('title', textConf.title)
               .html('&nbsp;').on(clickStr, tools.colorPicker.activate),
               jQDesatOuter = tools.colorPicker.jQDesatOuter = $(document.createElement('input')).prop({
                   'title': textConf.desatOuter.title,
                   'type': 'checkbox',
                   'checked': config.disColorOuter ? checkedStr : ''
               }).on(clickStr, function() {
                   config.disColorOuter = $(this).is(':checked');
                   if (config.colorSelected) {
                       tools.colorPicker.applyCPFilter();
                   }
               }),
               jQDesatOuterGroup = $(document.createElement(spanStr)).addClass(sbClass)
               .append($(document.createElement(spanStr)).html(textConf.desatOuter.txt))
               .append(jQDesatOuter),
               jQToggleView = tools.colorPicker.jQToggleView = $(document.createElement('input')).prop({
                   'title': textConf.toggleView.title,
                   'type': 'checkbox',
                   'checked': config.showOriginal ? checkedStr : ''
               }).on(clickStr, function() {
                   config.showOriginal = $(this).is(':checked');
                   if (!config.colorSelected) {
                       tools.colorPicker.toggleView();
                   }
               }),
               jQToggleViewGrp = $(document.createElement(spanStr)).addClass(sbClass)
               .append($(document.createElement(spanStr)).html(textConf.toggleView.txt))
               .append(jQToggleView),
               afterClickSubTools = tools.colorPicker.afterClickSubTools = $(document.createElement(spanStr))
               .append(delElemGroup).append(newCPGroup),
               beforeClickSubTools = tools.colorPicker.beforeClickSubTools = $(document.createElement(spanStr))
               .append(jQToggleViewGrp);


           tools.colorPicker.jQPickerToolBox = $(document.createElement('div'))
               .append($(document.createElement(spanStr)).addClass(sbClass).append($(document.createElement(spanStr))
                   .html(textConf.color.txt)).append(jQCPSpan)).append($(document.createElement(spanStr))
                   .addClass(sbClass).append($(document.createElement(spanStr)).html(textConf.tolerance.txt))
                   .append(jQSlider)).append(jQDesatOuterGroup).append(beforeClickSubTools).append(afterClickSubTools);

           jQSlider.slider({
               min: 0,
               max: 1,
               step: 0.1,
               value: config.sliderPos,
               change: function(event, ui) {
                   config.sliderPos = ui.value;
                   config.tolerance = config.sliderPos * 70;
                   tools.colorPicker.applyCPFilter();
               }
           });

           jQLeftToolBox.append(cpBtn);
       },
       activate: function() {
           var config = tools.colorPicker._config;
           //deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'colorPicker';

           config.cpCount = 0;
           config.lastStoredCP = -1;

           config.colorSelected = false;
           helper.removeWaterMark();
           config.oriImageData = colorCanvas.ctx.getImageData(0, 0, canvasW, canvasH);
           config.initialImageData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           config.filteredData = visualCanv.ctx.getImageData(0, 0, canvasW, canvasH);
           helper.drawWaterMark();

           jQSubtool.append(tools.colorPicker.jQPickerToolBox);
           jQCanvas.addClass(cpClass).on(clickStr, tools.colorPicker._canvasClick)
               .on(mouseMoveStr, tools.colorPicker.canvasMouseMove);
           tools.colorPicker.afterClickSubTools.hide();
           tools.colorPicker.beforeClickSubTools.show();

           tools.colorPicker.btn.addClass(selBtnClass);

           config.disColorOuter = !helper._config.edited;

           tools.colorPicker.jQDesatOuter.prop({
               'checked': config.disColorOuter ? checkedStr : ''
           });

           config.showOriginal = false;

           tools.colorPicker.jQToggleView.prop({
               'checked': config.showOriginal ? checkedStr : ''
           });
       },
       deActivate: function() {
           var config = tools.colorPicker._config;
           helper._config.activTool = '';
           tools.colorPicker.jQPickerToolBox.detach();
           jQCanvas.removeClass(cpClass).off(clickStr, tools.colorPicker._canvasClick)
               .off(mouseMoveStr, tools.colorPicker.canvasMouseMove);
           tools.colorPicker.btn.removeClass(selBtnClass);
           if (!config.colorSelected) {
               visualCanv.ctx.putImageData(config.initialImageData, 0, 0);
               helper.drawWaterMark();
           }
       },
       _canvasClick: function(e) {
           var config = tools.colorPicker._config,
               offset = jQCanvas.offset(),
               oriImageData = config.oriImageData.data,
               posX = config.posX = mathRound(e.pageX - offset.left),
               posY = config.posY = mathRound(e.pageY - offset.top),
               pos = (posY * canvasW + posX) * 4,
               colorData;

           colorData = config.colorData = [oriImageData[pos], oriImageData[pos + 1], oriImageData[pos + 2],
               oriImageData[pos + 3]
           ];

           tools.colorPicker.jQCPSpan.css(bgColorStr, rgbsStr + colorData[0] + commaStr + colorData[1] +
               commaStr + colorData[2] + commaStr + (Math.round((colorData[3] / 255) * 100) / 100) + closeBrac);

           tools.colorPicker.applyCPFilter();
           tools.colorPicker.afterClickSubTools.show();
           tools.colorPicker.beforeClickSubTools.hide();

           config.colorSelected = true;
           jQCanvas.removeClass(cpClass).off(clickStr, tools.colorPicker._canvasClick)
               .off(mouseMoveStr, tools.colorPicker.canvasMouseMove);
       },
       applyCPFilter: function() {
           var config = tools.colorPicker._config,
               oriImageData = config.oriImageData.data,
               imageData = config.filteredData.data,
               initData = config.initialImageData.data,
               colorData = config.colorData,
               tolerance = config.tolerance,
               i, l = canvasW * canvasH,
               index1 = 0,
               r = colorData[0],
               g = colorData[1],
               b = colorData[2];


           for (i = 0; i < l; i += 1, index1 += 4) {
               if (mathSqrt(mathPow(oriImageData[index1] - r, 2) + mathPow(oriImageData[index1 + 1] - g, 2) +
                       mathPow(oriImageData[index1 + 2] - b, 2)) <= tolerance) {
                   imageData[index1] = oriImageData[index1];
                   imageData[index1 + 1] = oriImageData[index1 + 1];
                   imageData[index1 + 2] = oriImageData[index1 + 2];
               } else {
                   if (config.disColorOuter) {
                       imageData[index1] = imageData[index1 + 1] = imageData[index1 + 2] = 0.21 * oriImageData[index1] +
                           0.72 * oriImageData[index1 + 1] + 0.07 * oriImageData[index1 + 2];
                   } else {
                       imageData[index1] = initData[index1];
                       imageData[index1 + 1] = initData[index1 + 1];
                       imageData[index1 + 2] = initData[index1 + 2];
                   }
               }

           }

           // apply the images
           visualCanv.ctx.putImageData(config.filteredData, 0, 0);
           helper.drawWaterMark();

           if (config.colorSelected) {
               tools.redoUndo.updateLastPoint();
           } else {
               tools.redoUndo.createRestore();
           }

       },
       deleteCP: function() {
           if (tools.colorPicker._config.colorSelected) {
               tools.redoUndo.unDo();
           }
           tools.colorPicker.activate();
       },
       newCP: function() {
           tools.colorPicker.activate();
       },
       canvasMouseMove: function(e) {
           var offset = jQCanvas.offset(),
               oriImageData = tools.colorPicker._config.oriImageData.data,
               posX = mathRound(e.pageX - offset.left),
               posY = mathRound(e.pageY - offset.top),
               pos = (posY * canvasW + posX) * 4;
           tools.colorPicker.jQCPSpan.css(bgColorStr, rgbsStr + oriImageData[pos] + commaStr +
               oriImageData[pos + 1] + commaStr + oriImageData[pos + 2] + commaStr + 1 + closeBrac);
       },
       toggleView: function() {
           var config = tools.colorPicker._config;
           visualCanv.ctx.putImageData(config.showOriginal ? config.oriImageData : config.initialImageData, 0, 0);
           helper.drawWaterMark();
       }

   };


   tools.resize = {
       _config: {
           classStore: ['', 'overlay_nw', 'overlay_n', 'overlay_ne', 'overlay_e', 'overlay_se', 'overlay_s',
               'overlay_sw', 'overlay_w', ''
           ],
           aspectRatios: [{
               width: 16,
               height: 9,
               label: '16*9'
           }, {
               width: 4,
               height: 3,
               label: '4*3'
           }, {
               width: 21,
               height: 9,
               label: '21*9'
           }, {
               width: 1,
               height: 1,
               label: '1*1'
           }]
       },
       reset: function() {

       },
       init: function() {
           var thisTool = tools.resize,
               config = thisTool._config,
               aspectRatios = config.aspectRatios,
               i,
               l = aspectRatios.length,
               aspectRatioGroup = tools.resize.aspectRatioGroup = $(document.createElement(spanStr)).
           addClass('ar_group'),
               clickFnGetter = function(index) {
                   return function() {
                       tools.resize.changeAR(index);
                   };
               };

           for (i = 0; i < l; i += 1) {
               aspectRatioGroup.append($(document.createElement(spanStr)).html(aspectRatios[i].label)
                   .addClass('ar_btn').on('click', clickFnGetter(i)));
           }



           tools.resize.jQResizeToolBox = $(document.createElement('div')).append(aspectRatioGroup)
               .append($(document.createElement(spanStr)).html('go').addClass('go_btn')
                   .on('click', tools.resize.deActivate));

           config.NEElem = $(document.createElement('div')).addClass('overlay_btn overlay_ne');
           config.NElem = $(document.createElement('div')).addClass('overlay_btn overlay_n');
           config.NWElem = $(document.createElement('div')).addClass('overlay_btn overlay_nw');
           config.WElem = $(document.createElement('div')).addClass('overlay_btn overlay_w');
           config.SWElem = $(document.createElement('div')).addClass('overlay_btn overlay_sw');
           config.SElem = $(document.createElement('div')).addClass('overlay_btn overlay_s');
           config.SEElem = $(document.createElement('div')).addClass('overlay_btn overlay_se');
           config.EElem = $(document.createElement('div')).addClass('overlay_btn overlay_e');

           helper.addDgarMoveEvent(config.NEElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(3);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.NElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(2);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.NWElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(1);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.WElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(8);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.SWElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(7);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.SElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(6);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.SEElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(5);
               },
               thisTool.borderDragEnd, undefined, true, true);
           helper.addDgarMoveEvent(config.EElem, thisTool.borderDrag, function() {
                   thisTool.borderDragStart(4);
               },
               thisTool.borderDragEnd, undefined, true, true);
       },
       activate: function() {
           var config = tools.resize._config,
               // NEElem = config.NEElem,
               // NElem = config.NElem,
               // NWElem = config.NWElem,
               // WElem = config.WElem,
               // SWElem = config.SWElem,
               // SElem = config.SElem,
               SEElem = config.SEElem;
           // EElem = config.EElem;

           // set the name of current active tool
           helper._config.activTool = 'resize';

           $('div.canvas-holder').append(SEElem);
           //.append(NElem).append(WElem).append(SElem).append(EElem).append(NEElem).append(NWElem).append(SWElem)

           config.canvasMove = helper.addDgarMoveEvent(jQCanvas, tools.resize.borderDrag, function() {
                   tools.resize.borderDragStart(9);
               },
               tools.resize.borderDragEnd, undefined, true, true);

           config.x = canvasW / 4;
           config.y = canvasH / 4;
           config.w = canvasW / 2;
           config.h = canvasH / 2;
           // set the overlay
           visualCanv.ctx.fillStyle = 'rgba(10,10,10,0.5)';
           tools.resize._drawOverLay(config.x, config.y, config.w, config.h);

           jQCanvas.addClass('drag_enabled');
           jQSubtool.append(tools.resize.jQResizeToolBox);
           tools.resize.changeAR(0);
       },
       deActivate: function() {
           var config = tools.resize._config,
               imageData = visualCanv.ctx.getImageData(config.x, config.y, config.w, config.h);
           canvasW = visualCanv.canvasElem.width = config.w;
           canvasH = visualCanv.canvasElem.height = config.h;
           visualCanv.ctx.putImageData(imageData, 0, 0);
           config.NEElem.detach();
           config.NElem.detach();
           config.NWElem.detach();
           config.WElem.detach();
           config.SWElem.detach();
           config.SElem.detach();
           config.SEElem.detach();
           config.EElem.detach();
           tools.resize.jQResizeToolBox.detach();
           jQCanvas.removeClass('drag_enabled');
           config.canvasMove();
           helper.postCrop();
       },
       changeAR: function(index) {
           var config = tools.resize._config,
               aspectRatios = config.aspectRatios,
               ar = aspectRatios[index],
               arWidth = ar.width,
               arHeight = ar.height,
               oldH = config.h,
               oldW = config.w,
               newH = mathRound((oldW / arWidth) * arHeight),
               maxH = canvasH - config.y,
               newW,
               maxW;

           if (newH > oldH) {
               if (newH <= maxH) {
                   config.h = newH;
               } else {
                   config.h = maxH;
                   config.w = (maxH / arHeight) * arWidth;
               }
           } else {
               newW = mathRound((oldH / arHeight) * arWidth);
               maxW = canvasW - config.x;
               if (newW <= maxW) {
                   config.w = newW;
               } else {
                   config.w = maxW;
                   config.h = (maxW / arWidth) * arHeight;
               }
           }
           tools.resize._drawOverLay(config.x, config.y, config.w, config.h);
           config.AR = index;

           tools.resize.aspectRatioGroup.children('.ar_selected').removeClass('ar_selected');
           tools.resize.aspectRatioGroup.children().eq(index).addClass('ar_selected');
       },
       borderDrag: function(e) {
           // @note min size is 2 * 2
           var config = tools.resize._config,
               aspectRatios = config.aspectRatios,
               arIndex = config.AR,
               ar = aspectRatios[arIndex],
               arWidth = ar.width,
               arHeight = ar.height,
               dragObj = config.drag,
               type = dragObj.type, // 1 nw, 2 n, 3 ne, 4 e, 5 se, 6 s, 7 sw, 8 w, 9 drag
               newX = config.x,
               newY = config.y,
               newW = config.w,
               newH = config.h,
               maxW = canvasW - (newX + newW),
               maxH = canvasH - (newY + newH),
               maxHAR = mathRound((maxW / arWidth) * arHeight),
               maxWAR = mathRound((maxH / arHeight) * arWidth),
               dragX = mathRound(e.dragX),
               dragY = mathRound(e.dragY),
               dragXAR = mathRound((dragY / arHeight) * arWidth);



           if (type === 9) {
               dragX = dragX > maxW ? maxW : dragX;
               dragX = dragX < -newX ? -newX : dragX;
               dragY = dragY > maxH ? maxH : dragY;
               dragY = dragY < -newY ? -newY : dragY;
               newX += dragX;
               newY += dragY;
           } else {
               if (dragXAR > dragX) {
                   dragY = mathRound((dragX / arWidth) * arHeight);
               } else {
                   dragX = dragXAR;
               }

               if (maxHAR > maxH) {
                   maxW = maxWAR;
               } else {
                   maxH = maxHAR;
               }
               if (dragX > maxW) {
                   dragX = maxW;
                   dragY = maxH;
               }
               if (dragX <= -newW) {
                   dragX = -newW + 2;
                   dragY = -newH + 2;
               }
               newW += dragX;
               newH += dragY;

           }

           // if (type === 3 || type === 4 || type === 5) {
           //     dragX = dragX > maxW ? maxW : dragX;
           //     dragX = dragX <= -newW ? -newW + 2 : dragX;
           //     newW += dragX;
           // }
           // if (type === 1 || type === 2 || type === 3) {
           //     dragY = dragY >= newH ? newH - 2 : dragY;
           //     dragY = dragY < -newY ? -newY : dragY;
           //     newY += dragY;
           //     newH -= dragY;
           // }
           // if (type === 6 || type === 7 || type === 5) {
           //     dragY = dragY > maxH ? maxH : dragY;
           //     dragY = dragY <= -newH ? -newH + 2 : dragY;
           //     newH += dragY;
           // }
           // if (type === 7 || type === 8 || type === 1) {
           //     dragX = dragX >= newW ? newW - 2 : dragX;
           //     dragX = dragX < -newX ? -newX : dragX;
           //     newX += dragX;
           //     newW -= dragX;
           // }
           dragObj.x = newX;
           dragObj.y = newY;
           dragObj.w = newW;
           dragObj.h = newH;

           tools.resize._drawOverLay(newX, newY, newW, newH);
       },
       borderDragStart: function(type) {
           var config = tools.resize._config;
           config.drag = {
               x: config.x,
               y: config.y,
               w: config.w,
               h: config.h,
               type: type,
               className: config.classStore[type]
           };

           jQCanvas.addClass(config.drag.className);
       },
       borderDragEnd: function() {
           var config = tools.resize._config,
               dragObj = config.drag;
           if (!dragObj) {
               return;
           }
           config.x = dragObj.x;
           config.y = dragObj.y;
           config.w = dragObj.w;
           config.h = dragObj.h;
           jQCanvas.removeClass(config.drag.className);
       },
       _drawOverLay: function(newX, newY, newW, newH) {
           var config = tools.resize._config,
               x1 = newX,
               x2 = newX + newW / 2,
               x3 = newX + newW,
               y1 = newY,
               y2 = y1 + newH / 2,
               y3 = y1 + newH;

           // draw the image
           visualCanv.ctx.drawImage(visualCanv._helperCanvasElem, 0, 0);
           // draw the _drawOverLay
           visualCanv.ctx.fillRect(0, 0, canvasW, canvasH);

           //draw the visual part
           visualCanv.ctx.putImageData(visualCanv._helperCtx.getImageData(newX, newY, newW, newH), newX, newY);

           config.NWElem.css({
               'left': x1,
               'top': y1
           });
           config.NElem.css({
               'left': x2,
               'top': y1
           });
           config.NEElem.css({
               'left': x3,
               'top': y1
           });
           config.EElem.css({
               'left': x3,
               'top': y2
           });
           config.SEElem.css({
               'left': x3,
               'top': y3
           });
           config.SElem.css({
               'left': x2,
               'top': y3
           });
           config.SWElem.css({
               'left': x1,
               'top': y3
           });
           config.WElem.css({
               'left': x1,
               'top': y2
           });

       },


   };

   tools.overlayUploader = {
       _config: {},
       reset: function() {

       },
       init: function() {
           var fileUploaderOverlay = $(document.createElement('input')).attr('type', 'file').on('change', function(e) {
                   var reader = new FileReader();
                   reader.onload = function(event) {
                       helper.loadWaterMark(event.target.result);
                   };
                   reader.readAsDataURL(e.target.files[0]);
               }),
               overlayBtn = tools.overlayUploader.btn = $(document.createElement(spanStr))
               .addClass(tableBtnClass + ' btn_overlay').attr('title', 'Overlay')
               .html('&nbsp;').on(clickStr, tools.overlayUploader.activate),
               overlayZoomSlider = $(document.createElement('div')).addClass(sliderClass).attr('title',
                   'Slide to resize the overlay');

           overlayZoomSlider.slider({
               min: -3,
               max: 3,
               step: 0.2,
               value: helper._config.overlayZoomLevel,
               change: function(event, ui) {
                   helper._config.overlayZoomLevel = ui.value;
                   helper.removeWaterMark();
                   helper.drawWaterMark();
               }
           });

           tools.overlayUploader.jQOverlayToolBox = $(document.createElement('div'))
               .append($(document.createElement(spanStr))
                   .addClass(sbClass).append($(document.createElement(spanStr))
                       .html('Upload overlay:')).append(fileUploaderOverlay)).append($(document.createElement(spanStr))
                   .addClass(sbClass).append($(document.createElement(spanStr))
                       .html('Overlay Scalling:')).append(overlayZoomSlider));
           jQLeftToolBox.prepend(overlayBtn);
       },
       activate: function() {
           //var config = tools.overlayUploader._config;

           //deactive previous tool
           helper.deActivateTool();
           // set the name of current active tool
           helper._config.activTool = 'overlayUploader';

           jQSubtool.append(tools.overlayUploader.jQOverlayToolBox);
           tools.overlayUploader.btn.addClass(selBtnClass);

       },
       deActivate: function() {
           helper._config.activTool = '';
           tools.overlayUploader.jQOverlayToolBox.detach();
           tools.overlayUploader.btn.removeClass(selBtnClass);
       }

   };