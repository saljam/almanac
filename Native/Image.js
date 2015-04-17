Elm.Native = Elm.Native || {};
Elm.Native.Image = Elm.Native.Image || {};

Elm.Native.Image.make = function(localRuntime) {
    'use strict';

    localRuntime.Native = localRuntime.Native || {};
    localRuntime.Native.Image = localRuntime.Native.Image || {};
    if ('values' in localRuntime.Native.Image) {
        return localRuntime.Native.Image.values;
    }

    var Color = Elm.Color.make(localRuntime);
    var NativeElement = Elm.Native.Graphics.Element.make(localRuntime);

    function drawImage(ctx, form) {
        var img = new Image();
        img.src = form._3;
        var w = form._1,
            h = form._2,
            srcX = form._1,
            srcY = form._2,
            srcW = w,
            srcH = h,
            destX = -w/2,
            destY = -h/2,
            destW = w,
            destH = h;

        ctx.scale(1,-1);
        img.onload = function() { ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH); }
    }

    function makeCanvas(w,h) {
        var canvas = NativeElement.createNode('canvas');
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';
        canvas.style.display = "block";
        canvas.style.position = "absolute";
        canvas.width  = w;
        canvas.height = h;
        return canvas;
    }

    function imgData(element) {
        var f = element.element;
        console.log(f)
        var canvas = makeCanvas(f._1,f._2);
        var ctx = canvas.getContext('2d');
        var img = drawImage(ctx, f);
        return F2( function(x, y) {
            var data = ctx.getImageData(x, y, 1, 1).data;
            console.log(data);
            return A3( Color.rgb, data[0], data[1], data[3] );
        } )
    }

    return localRuntime.Native.Image.values = {
        imgData:imgData
    };
};
