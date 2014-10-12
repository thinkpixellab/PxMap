
function PositionMap(canvas, statesData) {
    
    PxMap.Map.call(this, canvas, statesData);

    this.positionMap = new PxMap.Map(null, statesData);
    this.positionMap.getStateRenderOptions = $.proxy(
        this.getPositionStateRenderOptions, this);
    this.positionMapDirty = true;
}

PositionMap.prototype = Object.create(PxMap.Map.prototype);
PositionMap.prototype.constructor = PositionMap;

PositionMap.prototype.resize = function(options) {

    PxMap.Map.prototype.resize.call(this, options);
    this.positionMap.resize(options);
    this.positionMapDirty = true;

    // Need to increment by colors by more than 1 to avoid issues
    // with pixel blending at borders when map is resized

    // TODO: implement a more robust solution that allows more than
    // 50 states since 256 is max color value for one channel
    this.colorIncrement = 5;
};

PositionMap.prototype.render = function() {

    PxMap.Map.prototype.render.call(this);

    if (this.positionMapDirty) {
        this.positionMap.render();
    }
};

PositionMap.prototype.getStateCode = function(x, y) {
    var pixelData = this.positionMap.ctx.getImageData(x, y, 1, 1).data;
    var colorValue = pixelData[0];

    if (colorValue > 0 && colorValue % this.colorIncrement === 0) {
        var stateIndex = (colorValue / this.colorIncrement) - 1;
        return this.stateCodes[stateIndex];
    }

    return null;
};

PositionMap.prototype.getPositionStateRenderOptions = function(stateCode) {

    var stateIndex = this.stateCodes.indexOf(stateCode);
    var colorValue = (stateIndex + 1) * this.colorIncrement;

    return {
        fill: 'rgba(' + colorValue + ',0,0,1)',
        strokeWidth: 0,
        stroke: 'transparent'
    };
};

PxMap.PositionMap = PositionMap;