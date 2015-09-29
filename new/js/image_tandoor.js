imageTandoor = (function() {
    var jQCanvas = $('#imageCanvas'),

        jQSubtool = $('#subtool'),
        jQLeftToolBox = $('#tools'),


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
        maxHue = 0.4, //(24 degree)

        // frequently used methods
        mathPow = Math.pow,
        mathSqrt = Math.sqrt,
        mathRound = Math.round,
        mathAbs = Math.abs;

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
        selBtnClass = 'active',
        tableBtnClass = 'add_table_data_botton_class btn btn-primary btn-bordered ',
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


    helper.loadImage = function(src, type) {
        if (src) {
            if (type == 'url') {
                var img = new Image();
                img.onload = function() {



                    // set the canvas size
                    canvasW = visualCanv._helperCanvasElem.width = visualCanv.canvasElem.width = img.width;
                    canvasH = visualCanv._helperCanvasElem.height = visualCanv.canvasElem.height = img.height;

                    visualCanv.ctx.drawImage(img, 0, 0);
                };
                img.src = src;
            } else if (type == 'imagedata') {

            }
        }
    };

    helper.postVisCavDraw = function() {
        //deactive previous tool
        helper.deActivateTool();

        visualCanv._helperCtx.drawImage(visualCanv.canvasElem, 0, 0);

        // load the crop tool  
        tools.resize.activate();

    };



// ****** Tools ******/



   tools.resize = {
       _config: {
           classStore: ['', 'overlay_nw', 'overlay_n', 'overlay_ne', 'overlay_e', 'overlay_se', 'overlay_s',
               'overlay_sw', 'overlay_w', ''
           ],
           aspectRatios: [{
               //     width: 16,
               //     height: 9,
               //     label: '16*9'
               // }, {
               //     width: 4,
               //     height: 3,
               //     label: '4*3'
               // }, {
               //     width: 21,
               //     height: 9,
               //     label: '21*9'
               // }, {
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



           tools.resize.jQResizeToolBox = $(document.createElement('div')).addClass('subtool-holder')
               //.append(aspectRatioGroup);
               //.append($(document.createElement(spanStr)).html('go').addClass('go_btn')
               //.on('click', tools.resize.deActivate));

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
               SEElem = config.SEElem;
           // EElem = config.EElem;

           // set the name of current active tool
           helper._config.activTool = 'resize';

           $('div.canvas-holder').append(SEElem);
           
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
               type = dragObj.type, 
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
               // x1 = newX,
               // x2 = newX + newW / 2,
               x3 = newX + newW,
               y1 = newY,
               // y2 = y1 + newH / 2,
               y3 = y1 + newH;

           // draw the image
           visualCanv.ctx.drawImage(visualCanv._helperCanvasElem, 0, 0);
           // draw the _drawOverLay
           visualCanv.ctx.fillRect(0, 0, canvasW, canvasH);

           //draw the visual part
           visualCanv.ctx.putImageData(visualCanv._helperCtx.getImageData(newX, newY, newW, newH), newX, newY);
           config.SEElem.css({
               'left': x3,
               'top': y3
           });

       },


   };




    return helper
})()