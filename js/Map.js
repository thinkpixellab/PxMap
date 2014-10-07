/*global module:true, root:true, exports:true*/

(function() {


    var renderOptions = {

        bounds: {
            x: 0, // todo
            y: 0, // todo
            width: 400,
            height: 400,
            fill: null
        },

        // stroke
        stroke: '#FFFFFF',
        strokeWidth: 1,

        // regular color fill
        fill: '#E89000',

        // gradient fill (wins when set) (todo)
        gradientTop: null,
        gradientBottom: null,

        // labels (todo)
        showLabel: false,
        labelFont: 'sans-serif',
        labelFontSize: '12px',
    };

    function PxMap(ctx, statesData) {
        this.states = statesData || PxMap.UsStates;
        this.ctx = ctx;
    }

    PxMap.prototype.renderCountry = function(x, y, scale) {

        var ctx = this.ctx;
        ctx.save();
        if (x || y) {
            ctx.translate(x || 0, y || 0);
        }
        if (scale && scale !== 1) {
            this.ctx.scale(scale, scale);
        }

        var stateKey, state, stateOptions;
        for (stateKey in this.states) {
            state = this.states[stateKey];
            stateOptions = this.getStateRenderOptions(state.code);
            this.renderState(state.code, stateOptions, true);
        }

        ctx.restore();
    };

    // caller will override default render options (random shade of red)
    PxMap.prototype.getStateRenderOptions = function(stateCode) {
        var alpha = 0.35 + (Math.random() * 0.35);
        return {
            fill: 'rgba(255,0,0,' + alpha + ')',
            strokeWidth: 0,
            stroke: 'white'
        };
    };

    PxMap.prototype.renderState = function(stateCode, options, inMap) {

        var ctx = this.ctx;
        options = $.extend(true, {}, renderOptions, options);

        var state = this.states[stateCode],
            startPoint = state.boxOffset,
            commands = state.commands,
            scale = 1,
            nudge = {
                x: 0,
                y: 0
            };

        // if we're in a map, we need to use the map offset
        if (inMap) {
            startPoint = state.mapOffset;
        }

        // otherwise, we scale and nudge to fit in a bounding box
        else {

            // calculate the scale                
            scale = state.width / state.height > options.bounds.width / options.bounds.height ?
                options.bounds.width / state.width :
                options.bounds.height / state.height;

            // calculate nudges to center it
            nudge.x = (options.bounds.width - (state.width * scale)) / (2 * scale);
            nudge.y = (options.bounds.height - (state.height * scale)) / (2 * scale);
        }

        // get ready to rumble
        ctx.save();

        // draw the bounding box
        if (!inMap && options.bounds && options.bounds.fill) {
            ctx.rect(options.bounds.x, options.bounds.y, options.bounds.width, options.bounds.height);
            ctx.fillStyle = options.bounds.fill;
            ctx.fill();
        }

        // apply the scale
        ctx.scale(scale, scale);

        // begin drawing
        ctx.beginPath();

        // adjust the start pint
        startPoint.x += nudge.x;
        startPoint.x += nudge.y;
        var prevPoint = {
            x: startPoint.x,
            y: startPoint.y
        };

        // move to the starting point
        ctx.moveTo(startPoint.x, startPoint.y);
        //console.log('ctx.moveTo(' + startPoint.x + ', ' + startPoint.y + ');');

        // process the drawing commands
        for (var i = 0; i < commands.length; i++) {

            var c = commands[i].c,
                x = prevPoint.x + commands[i].x,
                y = prevPoint.y + commands[i].y;

            switch (c) {

                case 'l':
                    ctx.lineTo(x, y);
                    //console.log('ctx.lineTo(' + x + ', ' + y + ');');
                    break;

                case 'c':

                    var x1 = prevPoint.x + commands[i].x1,
                        y1 = prevPoint.y + commands[i].y1,

                        x2 = prevPoint.x + commands[i].x2,
                        y2 = prevPoint.y + commands[i].y2;

                    x = prevPoint.x + commands[i].x3;
                    y = prevPoint.y + commands[i].y3;

                    ctx.bezierCurveTo(x1, y1, x2, y2, x, y);
                    //console.log('ctx.bezierCurveTo(' + x1  + ', ' + y1 + ',' + x2 + ', ' + y2 + ',' + x + ',' + y + ');');

                    prevPoint.x = x;
                    prevPoint.y = y;

                    break;

                case 'm':
                    ctx.moveTo(x, y);
                    //console.log('ctx.moveTo(' + x + ', ' + y + ');');
                    break;

                case 'z':
                    ctx.closePath();
                    //console.log('ctx.closePath();');
                    break;
            }

            if (commands[i].x) {
                prevPoint.x = x;
            }

            if (commands[i].y) {
                prevPoint.y = y;
            }
        }

        ctx.fillStyle = options.fill;
        ctx.fill();

        ctx.strokeStyle = options.stroke;
        ctx.lineWidth = options.strokeWidth / scale;
        ctx.stroke();

        ctx.restore();
    };

    // export if applicable otherwise expose on global object
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = PxMap;
        } else {
            exports.PxMap = PxMap;
        }
    } else {
        root.PxMap = PxMap;
    }

})();