/*global module:true, root:true, exports:true*/

function Map(canvas, statesData) {
    this.states = statesData || PxMap.UsStates;
    this.stateCodes = [];
    for (var stateKey in this.states) {
        this.stateCodes.push(stateKey);
    }

    this.canvas = canvas || document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.offsetX = 0;
    this.offsetY = 0;
    this.scale = 1;
}

Map.prototype.resize = function(options) {
    this.canvas.width = options.width;
    this.canvas.height = options.height;
    this.offsetX = options.offsetX;
    this.offsetY = options.offsetY;
    this.scale = options.scale;
};

Map.prototype.render = function() {

    var ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    if (this.offsetX || this.offsetY) {
        ctx.translate(this.offsetX || 0, this.offsetY || 0);
    }
    if (this.scale && this.scale !== 1) {
        this.ctx.scale(this.scale, this.scale);
    }

    var state, stateOptions, i, len;
    for (i = 0, len = this.stateCodes.length; i < len; i++) {
        state = this.states[this.stateCodes[i]];
        stateOptions = this.getStateRenderOptions(state.code);
        this.renderState(state.code, stateOptions, true);
    }

    ctx.restore();
};

// caller will override default render options (random shade of red)
Map.prototype.getStateRenderOptions = function(stateCode) {
    var alpha = 0.35 + (Math.random() * 0.35);
    return {
        fill: 'rgba(255,0,0,' + alpha + ')',
        strokeWidth: 0,
        stroke: 'white'
    };
};

Map.prototype.renderState = function(stateCode, options, inMap) {

    var ctx = this.ctx;

    // merge options with defaults
    options = $.extend(true, {}, {
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
        labelOffset: {
            x: 0,
            y: 0
        },
        labelFill: 'white',
        labelFont: '12px sans-serif',
    }, options);

    var state = this.states[stateCode],
        startPoint = {
            x: state.boxOffset.x,
            y: state.boxOffset.y
        },
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

    // draw the label
    if (options.showLabel) {
        ctx.fillStyle = options.labelFill;
        ctx.font = options.labelFont;
        ctx.fillText(
            stateCode, 
            startPoint.x + options.labelOffset.x, 
            startPoint.y + options.labelOffset.y);
    }

    //ctx.fillStyle = 'black';
    //ctx.font="20px sans-serif";
    //ctx.fillText(stateCode,startPoint.x,startPoint.y);

    ctx.restore();
};

var PxMap = { Map: Map };

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

