
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
};

PositionMap.prototype.render = function() {

    PxMap.Map.prototype.render.call(this);

    if (this.positionMapDirty) {
        this.positionMap.render();
    }
};

PositionMap.prototype.getStateCode = function(x, y) {
    var pixelData = this.positionMap.ctx.getImageData(x, y, 1, 1).data;
    var stateNumber = pixelData[0];
    if (stateNumber > 0) {
        return this.stateCodes[stateNumber - 1];
    }

    return null;
};

PositionMap.prototype.getPositionStateRenderOptions = function(stateCode) {
    
    var stateIndex = this.stateCodes.indexOf(stateCode);

    return {
        fill: 'rgba(' + (stateIndex + 1) + ',0,0,1)',
        strokeWidth: 0,
        stroke: 'transparent'
    };
};

PxMap.PositionMap = PositionMap;