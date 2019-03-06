var verticalMargin = 65;    //垂直间隔
var horizontalMargin = 50;  //水平间隔
var nodeBorderMargin = 6;   //框的显示margin
var mouseClickRadius = 70;
var spousalSpacing = 50;    //夫妻间隔
var box_width = 90; //格子宽度
var box_height = 144;   //格子高度
var name_font = 20; //名字大小
var font_style = "微软雅黑";  //名字字体
var name_margin = 130;  //名字margin-top
var xhrTimeout = 20000;
var boxList = [];
var structure;
var canvasView;
var last_x = 0;
var last_y = 0;


var loadImage = function (src) {
    var img = new Image();
    img.src = src;
    return img;
}

var displayError = function (msg, b) {
    window.alert(msg);
}

var isvisible = function (obj) {
    return obj.offsetWidth > 0 && obj.offsetHeight > 0;
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

var fetchStaticJson = function (addr, callback, timeout) {
    var xhr = new XMLHttpRequest();
    var called = false;
    var started = false;
    var readystatechange = function (evt) {
        var ret = null;
        if (xhr.status && xhr.status != 200) {
            called = true;
            callback(null);
            return;
        }
        if (xhr.readyState == 4) {
            try {
                ret = JSON.parse(xhr.responseText)
            }
            catch (err) {
            }
            if (!called) {
                called = true;
                callback(ret);
            }
        }
    }
    if (timeout)
        setTimeout(function () {
            if (!called && !started) {
                called = true;
                callback(null);
            }
        }, timeout);
    xhr.addEventListener("readystatechange", readystatechange);
    xhr.open("GET", addr, true);

    if (xhr.overrideMimeType) //IE9 does not have this property
        xhr.overrideMimeType("application/json");

    xhr.send(null);
}

var loadData = function (callback) {
    var files = {
        // "structure_raw": structure_raw_url
        "structure_raw": 'https://zupu.jibai.com/jiapu/getTreeData'
    }
    var files_keys = Object.keys(files);
    var answers = files_keys.length;
    var errors = 0;
    for (var i = 0; i < files_keys.length; i++) {
        var src = files[files_keys[i]];
        (function () {
            var myii = i;

            // 本地数据
            var res_data = [{"spouses":[],"alive":1,"children":[],"sex":"f","name":"cuson","id":"3004062","avatar":"/images/female.png","secondName":"","parents":["3004059","3004060"],"register":0},{"spouses":["3004060"],"alive":1,"children":["3004062","3001571"],"sex":"f","name":"monther","id":"3004059","avatar":"/images/female.png","secondName":"","parents":[],"register":0},{"spouses":["3004059"],"alive":1,"children":["3001571","3004062"],"sex":"m","name":"father","id":"3004060","avatar":"/images/male.png","secondName":"","parents":[],"register":0},{"spouses":[],"alive":1,"children":[],"sex":"m","name":"黎黎明","mobile":"18811382869","id":"3001571","avatar":"/images/male.png","secondName":"黎明","parents":["3004060","3004059"],"register":1}];
            answers--;
            if (res_data == null) {
                errors++;
            }
           
            files[files_keys] = res_data;
            if (answers == 0) {
                if (errors == 0) {
                    var structure = {};
                    for (var i = 0; i < files["structure_raw"].length; i++)
                        structure[files["structure_raw"][i]["id"]] = files["structure_raw"][i];
                    files["structure"] = structure;
                    files["details"] = {};

                    callback(files);
                }else{
                    callback(null);
                }
            }

            // fetchStaticJson(src, function (js) {
            //     answers--;
            //     if (js == null) {
            //         errors++;
            //     }
            //     files[files_keys[myii]] = js;
            //     if (answers == 0) {
            //         if (errors == 0) {
            //             var structure = {};
            //             for (var i = 0; i < files["structure_raw"].length; i++)
            //                 structure[files["structure_raw"][i]["id"]] = files["structure_raw"][i];
            //             files["structure"] = structure;
            //             files["details"] = {};

            //             callback(files);
            //         }
            //         else
            //             callback(null);
            //     }
            // }, xhrTimeout);
        })();
    }
}

var jmap = function (fn, arr) {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result.push(fn(arr[i]));
    }
    return result;
}

String.prototype.trim = function () {
    return String(this).replace(/^\s+|\s+$/g, '');
}

Array.prototype.addonce = function (val) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] == val)
            return;
    }
    this.push(val);
}

Array.prototype.equals = function (array) {
    if (!array)
        return false;

    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        if (this[i] instanceof Array && array[i] instanceof Array) {
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            return false;
        }
    }
    return true;
}

var arrayContains = function(arr, obj) {
    var i = arr.length;
    while (i--) {
        if (arr[i] === obj) {
            return true;
        }
    }
    return false;
}

var sortByGender = function (structure, personList) {
    return personList.slice().sort(function (a, b) { return -structure[a]["sex"].localeCompare(structure[b]["sex"]) });
}

var flattenTree = function (node) {
    var all = [];
    var flattenTreeHelper = function (node) {
        var rels = [node].concat(node.ascendents_down).concat(node.descendents_down).concat(node.ascendents_up).concat(node.descendents_up);
        for (var i = 0; i < rels.length; i++) {
            if (all.indexOf(rels[i]) < 0) {
                all.push(rels[i]);
                flattenTreeHelper(rels[i]);
            }
        }
    }
    flattenTreeHelper(node);
    return all;
}

var Layout = function (person, structure, view) {
    var getSpouses = function (person) {
        return structure[person].spouses;
    }
    var getParents = function (person) {
        return sortByGender(structure, structure[person].parents);
    }
    var getChildren = function (person) {
        var children = [];
        var spouses = getSpouses(person);

        for (var i = 0; i < structure[person].children.length; i++)
            if (structure[structure[person].children[i]].parents.length == 1)
                children.push(structure[person].children[i]);

        for (var i = 0; i < spouses.length; i++) {
            for (var j = 0; j < structure[person].children.length; j++) {
                if (structure[spouses[i]].children.indexOf(structure[person].children[j]) >= 0) {
                    children.push(structure[person].children[j]);
                }
            }
        }
        return children;
    }
    var mappedNodes = {};
    var makeNode = function (person, generation) {
        if (person in mappedNodes)
            return mappedNodes[person];
        var newNode = null;
        if (getSpouses(person).length == 0) {
            newNode = Node(structure[person]);
            mappedNodes[person] = newNode;
        } else {
            var plist = [person].concat(getSpouses(person));
            newNode = NodeGroup(jmap(function (p) { return Node(structure[p]) }, plist));
            for (var i = 0; i < plist.length; i++)
                mappedNodes[plist[i]] = newNode;
        }
        newNode.generation = generation;
        if (getParents(person).length == 0)
            newNode.ascendents_down = [];
        else if (getParents(person)[0] in mappedNodes)
            newNode.ascendents_down = [makeNode(getParents(person)[0], generation - 1)];
        else
            newNode.ascendents_down = [];

        var childs = getChildren(person);
        if (childs.length > 0) {
            if (Math.abs(generation) < generationLimit) {
                newNode.descendents_down = [];
                for (var i = 0; i < childs.length; i++) {
                    var temp = makeNode(childs[i], generation + 1);
                    if (temp.ascendents_down.indexOf(newNode) < 0)
                        continue;
                    newNode.descendents_down.push(temp);
                }
            }
        }
        newNode.finalizeRelationships(structure);

        return newNode;
    }
    var verticalSpacing = function (view, node_list) {
        var maxheights = {};
        for (var i = 0; i < node_list.length; i++) {
            var dims = node_list[i].calcDimensions(view);
            var w = dims[0]; var h = dims[1];
            h = box_height * allScalingFonts[0].getSize() / 13;
            maxheights[node_list[i].generation] = Math.max(maxheights[node_list[i].generation] || 0, h);
        }
        var sumHeights = {};
        sumHeights[0] = 0;
        for (var i = 1; i in maxheights; i++)
            sumHeights[i] = sumHeights[i - 1] + maxheights[i - 1] + verticalMargin;
        for (var i = -1; i in maxheights; i--)
            sumHeights[i] = sumHeights[i + 1] - maxheights[i] - verticalMargin;
        for (var i = 0; i < node_list.length; i++) {
            var pos = node_list[i].getPos();
            var x = pos[0]; var y = pos[1];
            node_list[i].setPos(x, sumHeights[node_list[i].generation]);
        }
    }
    var helperIsNodeLeaf = function (node) {
        return node.descendents_down.length == 0;
    }
    var helperIsNodeLeftMost = function (node) {
        if (node.ascendents_down.length == 0)
            return true;
        return node.ascendents_down[0].descendents_down[0] == node;
    }
    var helperGetPreviousSibling = function (node) {
        if (node.ascendents_down.length == 0)
            debug("没有父母节点")
        var p = node.ascendents_down[0].descendents_down.indexOf(node);
        if (p <= 0)
            debug("do nothing");
        return node.ascendents_down[0].descendents_down[p - 1];
    }
    var getLeftContour = function (node) {
        var getLeftContourHelper = function (node, modSum, values) {
            if (node.generation in values)
                values[node.generation] = Math.min(values[node.generation], node.getX() + modSum);
            else
                values[node.generation] = node.getX() + modSum;

            modSum += node.mod;
            for (var i = 0; i < node.descendents_down.length; i++)
                getLeftContourHelper(node.descendents_down[i], modSum, values);
        }
        var values = {};
        getLeftContourHelper(node, 0, values);
        return values;
    }
    var getRightContour = function (node) {
        var getRightContourHelper = function (node, modSum, values) {
            if (node.generation in values)
                values[node.generation] = Math.max(values[node.generation], node.getX() + node.getWidth() + modSum);
            else
                values[node.generation] = node.getX() + node.getWidth() + modSum;

            modSum += node.mod;
            for (var i = 0; i < node.descendents_down.length; i++)
                getRightContourHelper(node.descendents_down[i], modSum, values);
        }
        var values = {};
        getRightContourHelper(node, 0, values);
        return values;
    }
    var checkForConflicts = function (node) {
        var treeDistance = 30; // minimum distance between cousin nodes
        var shift = 0;
        var nodeCounter = getLeftContour(node);
        if (node.ascendents_down.length == 0)
            return;
        for (var i = 0; i < node.ascendents_down[0].descendents_down.length,
            node.ascendents_down[0].descendents_down[i] != node; i++) {
            var sibling = node.ascendents_down[0].descendents_down[i];
            var siblingContour = getRightContour(sibling);

            for (var level = node.generation + 1; level in nodeCounter && level in siblingContour; level++) {
                var dist = nodeCounter[level] - siblingContour[level];
                if (dist + shift < treeDistance)
                    shift = treeDistance - dist;
            }
            if (shift > 0) {
                node.setX(node.getX() + shift);
                node.mod += shift;
                shift = 0;

                nodeCounter = getLeftContour(node);
            }
        }
    }
    var calculateInitialX = function (node) {
        for (var i = 0; i < node.descendents_down.length; i++)
            calculateInitialX(node.descendents_down[i]);
        if (helperIsNodeLeaf(node)) {
            if (helperIsNodeLeftMost(node))
                node.setX(0);
            else
                node.setX(helperGetPreviousSibling(node).getX() + helperGetPreviousSibling(node).getWidth() + horizontalMargin);
        } else {
            var left = node.descendents_down[0].getX();
            var lastchild = node.descendents_down[node.descendents_down.length - 1];
            var right = lastchild.getX() + lastchild.getWidth();
            var mid = (left + right) / 2;
            if (helperIsNodeLeftMost(node))
                node.setX(mid - node.getWidth() / 2);
            else {
                var prev = helperGetPreviousSibling(node);
                node.setX(prev.getX() + prev.getWidth() + horizontalMargin);
                node.mod = node.getX() - mid + node.getWidth() / 2;
            }
        }
        if (node.descendents_down.length > 0 && !helperIsNodeLeftMost(node))
            checkForConflicts(node);
    }
    var treeExtents = null;
    var calculateFinalPositions = function (node, modSum) {
        node.setX(node.getX() + modSum);
        modSum += node.mod;
        for (var i = 0; i < node.descendents_down.length; i++) {
            calculateFinalPositions(node.descendents_down[i], modSum);
        }
        if (treeExtents == null)
            treeExtents = [node.getX(), node.getY(), node.getX() + node.getWidth(), node.getY() + node.getHeight()]
        else {
            var x = treeExtents[0];
            var y = treeExtents[1];
            var x2 = treeExtents[2];
            var y2 = treeExtents[3];
            y = Math.min(y, node.getY());
            x = Math.min(x, node.getX());
            x2 = Math.max(x2, node.getX() + node.getWidth());
            y2 = Math.max(y2, node.getY() + node.getHeight());
            treeExtents = [x, y, x2, y2];
        }
    }
    return {
        getTreeExtents: function () {
            return treeExtents;
        },
        lookupNodeById: function (personid) {
            if (personid in mappedNodes)
                return mappedNodes[personid];
            else
                return null;
        },
        nodes: makeNode(person, 0),
        position: function (view) {
            var allnodes = flattenTree(this.nodes);

            verticalSpacing(view, allnodes);
            calculateInitialX(this.nodes);
            calculateFinalPositions(this.nodes, 0);
        }
    }
}

var TextAttr = function (_size, _font, _style, _color) {
    var determineFontHeight = function (fontStyle) {
        var body = document.getElementsByTagName("body")[0];
        var dummy = document.createElement("div");
        var dummyText = document.createTextNode("M");
        dummy.appendChild(dummyText);
        dummy.setAttribute("style", fontStyle);
        try {
            body.appendChild(dummy);
            return dummy.offsetHeight;
        }
        finally {
            body.removeChild(dummy);
        }
    }
    var size = _size;
    var lastHeight = 0;
    return {
        getSize: function () {
            return size;
        },
        setSize: function (s) {
            size = s;
            lastHeight = 0;
        },
        getheight: function () {
            if (lastHeight == 0) {
                lastHeight = determineFontHeight("font: " + this.astext());
            }
            return lastHeight;
        },
        astext: function () {
            return _style + " " + size + "px " + _font;
        },
        apply: function (view) {
            view.context.font = this.astext();
            view.context.fillStyle = _color;
        },
    }
}


var baseFont = TextAttr(13, "sans-serif", "normal", "#000000");
var detailFont = TextAttr(10, "sans-serif", "normal", "#808080");
var allScalingFonts = [baseFont, detailFont];
var defaultFontSize = 13;   //跟baseFont的fontsize相同

var simpleLine = function(view, ax, ay, bx, by, width, len, id) {
    //画左侧线
    var color = "#88f8ff";
    if(structure[id].sex == 'm'){
        color = "#ff8888";
    }
    view.context.strokeStyle = color;
    view.context.lineWidth = width;
    view.context.beginPath();
    view.context.moveTo(ax+view.scrollx,ay+view.scrolly);
    view.context.lineTo((bx-len)+view.scrollx,by+view.scrolly);
    view.context.stroke();

    //画右侧线
    color = "#ff8888";
    if(structure[id].sex == 'm'){
        color = "#88f8ff";
    }
    view.context.strokeStyle = color;
    view.context.lineWidth = width;
    view.context.beginPath();
    view.context.moveTo((bx-len)+view.scrollx,ay+view.scrolly);
    view.context.lineTo(bx+view.scrollx,by+view.scrolly);
    view.context.stroke();

    //画接头圆点
    view.context.beginPath();
    view.context.arc((bx-len)+view.scrollx, by+view.scrolly, 3, 0, Math.PI*2,true);
    view.context.fillStyle = "#ffffff";
    view.context.closePath();
    view.context.fill();
}

var drawParentalLine = function(view, parent, child) {
    var tmp = child.getParentConnectorPoint();
    var childx = tmp[0]; var childy = tmp[1];
    tmp = parent.getChildConnectorPoint();
    var parentx = tmp[0]-(parent.getWidth()/2)-spousalSpacing/2; var parenty = tmp[1]-parent.getHeight()/2-nodeBorderMargin;
    if(child.getParent_num() == 1){
        parentx = tmp[0];
        parenty = tmp[1];
    }
    var scale = allScalingFonts[0].getSize()/defaultFontSize;
    if(parent.shift > 1){
        parenty = parenty - 10*scale*(parent.shift-1);
    }

    childx+=view.scrollx; childy+=view.scrolly;
    parentx+=view.scrollx; parenty+=view.scrolly;

    view.context.strokeStyle = "#ffffff";
    view.context.lineWidth = 2;
    view.context.beginPath();
    view.context.moveTo(childx,childy);

    var radius = 10;

    var horizy = childy-verticalMargin/2;
    if(parent.shift > 1){
        horizy = childy-verticalMargin/2 + 6*scale*(parent.shift-1);
    }

    var dx_size = 10;

    if(childx + dx_size < parentx || childx > parentx + dx_size){
        var this_radius = radius;
        if(childx + dx_size < parentx){
            this_radius = -radius;
        }
        horizy = horizy+radius;
        view.context.lineTo(childx, horizy);
        view.context.arcTo(childx, horizy-radius, childx-this_radius, horizy-radius, radius);
        horizy = horizy-radius;
        parentx = parentx+this_radius
        view.context.lineTo(parentx, horizy);
        view.context.arcTo(parentx-this_radius, horizy, parentx-this_radius, horizy-radius, radius);
        parentx = parentx-this_radius
        view.context.lineTo(parentx, parenty);
        view.context.stroke();
    }else{
        view.context.lineTo(childx, horizy);
        view.context.lineTo(parentx, horizy);
        view.context.lineTo(parentx, parenty);
        view.context.stroke();
    }

    if(parent.shift > 1) {
        if (childx + dx_size < parentx || childx > parentx + dx_size) {
            view.context.beginPath();
            view.context.arc(parentx, parenty, 3, 0, Math.PI * 2, true);
            view.context.fillStyle = "#ffffff";
            view.context.closePath();
            view.context.fill();
        }
    }
}

var NodeGroup = function (_nodes) {
    var minHeight = 0;
    var repositionRelative = function (view) {
        for (var i = 1; i < _nodes.length; i++) {
            _nodes[i].setX(_nodes[i - 1].getX() + _nodes[i - 1].getWidth() + spousalSpacing);
            _nodes[i].setY(_nodes[i - 1].getY());
        }
    }
    var cached_dimensions = null;
    return {
        ascendents_up: [],
        descendents_up: [],
        ascendents_down: [],
        descendents_down: [],
        generation: 0,
        mod: 0,
        getInteriorNodeById: function (nodeid) {
            for (var i = 0; i < _nodes.length; i++)
                if (_nodes[i].getId() == nodeid)
                    return _nodes[i];
            return null;
        },
        finalizeRelationships: function (structure) {
            for (var i = 0; i < _nodes.length; i++) {
                _nodes[i].group = this;
                var prnts = structure[_nodes[i].getId()].parents;
                var display_prnts = [];
                for (var j = 0; j < this.ascendents_down.length; j++) {
                    display_prnts = display_prnts.concat(this.ascendents_down[j].getIds());
                }
                for (var j = 0; j < prnts.length; j++)
                    if (display_prnts.indexOf(prnts[j]) < 0)
                        _nodes[i].hidden_parents = true;

                var chlds = structure[_nodes[i].getId()].children;
                var display_chlds = [];
                for (var j = 0; j < this.descendents_down.length; j++)
                    display_chlds = display_chlds.concat(this.descendents_down[j].getIds());
                for (var j = 0; j < chlds.length; j++)
                    if (display_chlds.indexOf(chlds[j]) < 0)
                        _nodes[i].hidden_children = true;

                for (var j = 0; j < this.descendents_down.length; j++) {
                    var childid = this.descendents_down[j].getId()
                    var parentid = _nodes[i].getId();
                    if (structure[parentid].children.indexOf(childid) >= 0)
                        _nodes[i].descendents_down.addonce(this.descendents_down[j]);
                }
            }
        },
        getChildConnectorPoint: function () {
            debug("方法没有找到");
        },
        getParentConnectorPoint: function () {
            return _nodes[0].getParentConnectorPoint();
        },
        getParent_num: function(){
            return _nodes[0].getParent_num();
        },
        getId: function () {
            return _nodes[0].getId();
        },
        getIds: function () {
            var result = [];
            for (var i = 0; i < _nodes.length; i++)
                result.push(_nodes[i].getId());
            return result;
        },
        getText: function () {
            return "NodeGroup";
        },
        getX: function () {
            return _nodes[0].getX();
        },
        getY: function () {
            return _nodes[0].getY();
        },
        setX: function (a) {
            _nodes[0].setX(a);
            repositionRelative();
        },
        setY: function (a) {
            _nodes[0].setY(a);
            repositionRelative();
        },
        getPos: function () {
            return [_nodes[0].getX(), _nodes[0].getY()];
        },
        setPos: function (ax, ay) {
            _nodes[0].setX(ax);
            _nodes[0].setY(ay);
            repositionRelative();
        },
        toString: function () {
            return _nodes[0].toString();
        },
        getWidth: function () {
            var tmp = this.calcDimensions();
            return tmp[0];
        },
        getHeight: function () {
            var tmp = this.calcDimensions();
            return tmp[1];
        },
        calcDimensions: function (view) {
            if (cached_dimensions == null) {
                if (view == undefined)
                    debug("不计算");
                for (var i = 0; i < _nodes.length; i++)
                    _nodes[i].calcDimensions(view);

                repositionRelative(view);
                var left = _nodes[0].getX();
                var right = _nodes[_nodes.length - 1].getX() + _nodes[_nodes.length - 1].getWidth();
                var w = right - left;

                var maxheight = 0;
                for (var i = 0; i < _nodes.length; i++)
                    maxheight = Math.max(maxheight, _nodes[i].getHeight());
                var h = maxheight;
                cached_dimensions = [w, h];
                minHeight = _nodes[0].getHeight();
                for (var i = 1; i < _nodes.length; i++)
                    minHeight = Math.min(minHeight, _nodes[i].getHeight());
            }
            return cached_dimensions;
        },
        hitTest: function (view, x, y) {
            for (var i = 0; i < _nodes.length; i++) {
                var tmp = _nodes[i].hitTest(view, x, y);
                var isHit = tmp[0];
                var val = tmp[1];
                if (isHit)
                    return [isHit, val];
            }
            return [false, "none"];
        },
        draw : function(view) {
            // draw spouse-connecting line
            var linewidth = 2;
            var y = this.getY() + minHeight/2;
            var scale = allScalingFonts[0].getSize()/defaultFontSize;

            for(var i=1; i<_nodes.length; i++){
                var width = box_width*i*scale + spousalSpacing*i;
                simpleLine(view, this.getX(), y - (i-1)*10*scale,
                    this.getX()+width, y - (i-1)*10*scale, linewidth, spousalSpacing/2, _nodes[i].getId());
            }
            for (var i=0; i<_nodes.length; i++){
                _nodes[i].shift = i;
                _nodes[i].draw(view);
            }
        },
        drawLines : function(view) {
            var allIds = [];
            var spousesIds = [];
            var resultIds = [];
            if(_nodes.length>=2){
                for(var i=0; i<_nodes[0].descendents_down.length; i++){
                    allIds[allIds.length] = _nodes[0].descendents_down[i].getId();
                }
                for (var i=1; i<_nodes.length; i++){
                    for(var j=0; j<_nodes[i].descendents_down.length; j++){
                        spousesIds[spousesIds.length] = _nodes[i].descendents_down[j].getId();
                    }
                }
                for(var i=0; i<allIds.length; i++){
                    if(!arrayContains(spousesIds, allIds[i])){
                        resultIds[resultIds.length] = allIds[i];
                    }
                }
            }
            if(resultIds.length > 0){
                _nodes[0].drawLines_2(view, resultIds);
            }
            for (var i=1; i<_nodes.length; i++){
                _nodes[i].drawLines(view);
            }
        }
    }
}
//  draw a roundRect
var drawRoundRect = function (context, x, y, w, h, r, fillColor, fill, strokeColor) {
    w = w || 90;
    h = h || 144;
    r = r || 4;
    fillColor = fillColor || "#fff";
    fill = fill == undefined ? true : filll
    strokeColor = strokeColor || "#E6E6E6";

    if (w < 2 * r) {
        r = w / 2;
    }
    if (h < 2 * r){
        r = h / 2;
    }
    context.beginPath();
    context.moveTo(x+r, y);
    context.arcTo(x+w, y, x+w, y+h, r);
    context.arcTo(x+w, y+h, x, y+h, r);
    context.arcTo(x, y+h, x, y, r);
    context.arcTo(x, y, x+w, y, r);
    if (fill) {
        context.fillStyle = fillColor;
        context.fill();
    } else {
        context.strokStyle = strokeColor;
        context.lineWidth = 1;
        context.stroke();
    }
    
    context.closePath();
    return context;
}

var addText = function (context, text, x, y, style) {
    context.beginPath();
    context.fillStyle = "#4D4D4D";
    context.font = "36px " + font_style;
    context.fillText("+", x, y);
    context.closePath();
}

// parents tips box
var drawDashedGroup = function (context, x, y, w, h, r, strokeColor, name) {

    w = w || 90;
    h = h || 144;
    r = r || 4;
    strokeColor = strokeColor || "#fff";
    name = name || "父亲";

    var scale = allScalingFonts[0].getSize() / defaultFontSize;

    var container = drawRoundRect(context, x, y, w, h, r, "", false, strokeColor);
    
    context.beginPath();
    // arc 
    context.fillStyle = strokeColor;
    context.arc(x + 48, y + 40, 34 / 2, 0, 360);
    context.fill(); 
    context.closePath();

    // add: +
    addText(context, "+", x + 48, y + 40 + 10);

    context.beginPath();
    // parents name
    context.fillColor = strokeColor;
    context.font = 26 * scale + "px " + font_style;
    context.fillText(name, x + 40 + 4, y + 95 + 10);
    context.closePath();

    return context;
}

var Node = function (_person) {
    var name = _person['name'];

    var bgcolor = {
        "m": "#a7cbca",
        "f": "#dfa296",
        "z": "#d3d3d3",
        "n": "#333333",
    }
    var extraWidth = 20;
    var x = 0;
    var y = 0;
    return {
        ascendents_up: [],
        descendents_up: [],
        ascendents_down: [],
        descendents_down: [],
        generation: 0,
        mod: 0,
        hidden_parents: false,
        hidden_children: false,
        focused: false,
        parents_num: 0,
        group: null,
        shift:0,
        getInteriorNodeById: function (nodeid) {
            return this;
        },
        finalizeRelationships: function (structure) {
            var prnts = structure[this.getId()].parents;
            this.parents_num = prnts.length;
            var display_prnts = [];
            for (var j = 0; j < this.ascendents_down.length; j++) {
                display_prnts = display_prnts.concat(this.ascendents_down[j].getIds());
            }
            for (var j = 0; j < prnts.length; j++)
                if (display_prnts.indexOf(prnts[j]) < 0)
                    this.hidden_parents = true;
            var chlds = structure[this.getId()].children;
            var display_chlds = [];
            for (var j = 0; j < this.descendents_down.length; j++)
                display_chlds = display_chlds.concat(this.descendents_down[j].getIds());
            for (var j = 0; j < chlds.length; j++)
                if (display_chlds.indexOf(chlds[j]) < 0)
                    this.hidden_children = true;
        },
        getChildConnectorPoint: function () {
            var ax = x + this.getWidth() / 2;
            var ay = y + this.getHeight();
            return [ax, ay + nodeBorderMargin];
        },
        getParentConnectorPoint: function () {
            var ax = x + this.getWidth() / 2;
            var ay = y;
            return [ax, ay - nodeBorderMargin];
        },
        getParent_num: function(){
            return this.parents_num;
        },
        getId: function () {
            return _person.id;
        },
        getIds: function () {
            return [_person.id];
        },
        getText: function () {
            return _text;
        },
        getX: function () {
            return x;
        },
        getY: function () {
            return y;
        },
        setX: function (a) {
            x = a;
        },
        setY: function (a) {
            y = a;
        },
        getPos: function () {
            return [x, y];
        },
        setPos: function (ax, ay) {
            x = ax;
            y = ay;
        },
        toString: function () {
            return _person.name;
        },
        getWidth: function () {
            var tmp = this.calcDimensions();
            var w = tmp[0];
            return w;
        },
        getHeight: function () {
            var tmp = this.calcDimensions();
            var h = tmp[1];
            return h;
        },
        calcDimensions: function (view) {
            var prnts = structure[this.getId()].parents;
            this.parents_num = prnts.length;
            return [box_width * allScalingFonts[0].getSize() / 13, box_height * allScalingFonts[0].getSize() / 13];
        },
        getRect: function (view) {
            var tmp = this.calcDimensions(view);
            var w = tmp[0]; var h = tmp[1];
            return [x + view.scrollx - nodeBorderMargin,
            y + view.scrolly - nodeBorderMargin,
            w + nodeBorderMargin * 2,
            h + nodeBorderMargin * 2];
        },
        hitTest: function (view, x, y) {
            var tmp = this.getRect(view);
            var myx = tmp[0]; var myy = tmp[1]; var w = tmp[2]; var h = tmp[3];
            var right = myx + w;
            var bottom = myy + h;
            var isHit = (x >= myx) && (x <= right) && (y >= myy) && (y <= bottom);

            var result = [isHit, ["goto", this]];
            if (x < myx + extraWidth)
                result = [isHit, ["info", this]];
            return result;
        },
        draw: function (view) {
            var tmp = this.getPos();
            var x = tmp[0];
            var y = tmp[1];
            x += view.scrollx;
            y += view.scrolly;
            var tmp = this.getRect(view); var myx = tmp[0]; var myy = tmp[1]; var w = tmp[2]; var h = tmp[3];

            var defaultBoxDiv = document.getElementById("defaultBoxDiv"),
                _boxDiv = document.getElementById('boxDiv');
            if (x > view.canvas.width || x + w < 0 ||
                y > view.canvas.height || y + h < 0) {
                defaultBoxDiv.style.display = "none";
                return; // don't draw off screen
            }

            var scale = allScalingFonts[0].getSize() / defaultFontSize;

            // creator's backgroundColor is different from others
            drawRoundRect(view.context, myx, myy, w, h, 5 * scale, _person.id == initial_person ? "#87A734" : "#fff");

            // portrait
            var photosDiv = document.getElementById("photos");
            var img_avator = document.createElement("img");
            
            if(_person.avatar && _person.avatar.length > 0){
            	img_avator.src = _person.avatar;
            }else{
            	img_avator.src = _person.sex == 'm' ? '/images/male.png' : '/images/female.png';
            }
           
            img_avator.style.top = y - 7 + "px";
            img_avator.id = this.getId();
            img_avator.style.left = x - 6 + "px";
            img_avator.style.cursor = 'pointer';
            img_avator.style.position = "absolute";
            img_avator.style.borderTopLeftRadius = 4 * scale + "px";
            img_avator.style.borderTopRightRadius = 4 * scale + "px";
            img_avator.style.webkitBorderTopLeftRadius = 4 * scale + "px";
            img_avator.style.webkitBorderTopRightRadius = 4 * scale + "px";
            img_avator.style.cursor = "pointer";
            img_avator.style.objectFit = "cover";
            img_avator.style.width = w + 0 + "px";
            img_avator.style.height = w + "px";
            photosDiv.appendChild(img_avator);

            img_avator.onmouseenter = function (evt) {
                preventEvent(evt);
                evt.preventDefault();
                boxMouseOver(_boxDiv, [myx - 2, myy - 2, myx + w + 1, myy + h + 1, this.getId()]);
            }.bind(this);

            img_avator.onclick=function(){
            	showProfile(this.getId());
            }.bind(this);

            // name
            view.context.fillStyle = _person.id == initial_person ? "#fff" : bgcolor["n"];
            view.context.textAlign = 'center';
            view.context.font = name_font * scale + "px " + font_style;
            view.context.fillText(name, x + box_width * scale / 2, y + name_margin * scale, w);

            // 0: dead  1: alive
            if (_person.alive == 0) {
                var greyMask = document.createElement("div");
                greyMask.style.width = w + "px";
                greyMask.style.height = h + 1 + "px";
                greyMask.style.position = "absolute";
                greyMask.style.left = x - 6 + "px";
                greyMask.style.top = y - 7 + "px";
                greyMask.style.borderRadius = 4 * scale + "px";
                greyMask.style.webkitBorderRadius = 4 * scale + "px";
                greyMask.style.msBorderRadius = 4 * scale + "px";
                greyMask.style.oBorderRadius = 4 * scale + "px";
                greyMask.style.mozBorderRadius = 4 * scale + "px";
                greyMask.style.backgroundColor = "rgba(109,109,109,0.7)";
                greyMask.style.zIndex = 3;  // == person_option: z-index > 2: portrait and box || defaultBox
                greyMask.style.cursor = "pointer";
                greyMask.setAttribute("id", "mask_" + this.getId());
                photosDiv.appendChild(greyMask);
                greyMask.onmouseenter = function (ev) {
                    boxMouseOver(_boxDiv, [myx - 2, myy - 2, myx + w + 1, myy + h + 1, this.getId()]);
                }.bind(this);
            }

            // has parent or children
            if (this.hidden_parents || this.hidden_children) {
                var img_switch = document.createElement("img");
                img_switch.src = _person.sex == 'm' ? '/images/icon_arborescence_men.png' : '/images/icon_arborescence_women.png';
                img_switch.style.top = y - 5 * scale + 2 + "px";
                img_switch.style.left = x + "px";
                img_switch.style.position = "absolute";
                img_switch.id = _person.id;
                img_switch.height = 20 * scale;
                img_switch.width = 20 * scale;
                photosDiv.appendChild(img_switch);
                img_switch.onclick=function(){
                    reload(this.id);
                }
                img_switch.style.cursor = 'pointer';
                img_switch.onmouseenter = function (evt) {
                }
            }

            // if the one was invited
            if (1) {
                var img_leaf = document.createElement("img");
                img_leaf.src = _person.register == 1 ? '/images/green_leaf.png' : '/images/grey_leaf.png';
                img_leaf.style.top = y - 5 * scale + 2 + "px";
                img_leaf.style.left = x + 75 * scale + "px";
                img_leaf.style.position = "absolute";
                img_leaf.height = 27 * scale;
                img_leaf.width = 24 * scale;
                photosDiv.appendChild(img_leaf);
                img_leaf.style.cursor = 'pointer';
                img_leaf.onmouseenter = function () {
                }
            }

            // draw empty parents tip box
            if (this.getId() == "@I7@") {
                drawDashedGroup(view.context, myx - box_width - horizontalMargin * 2, myy -box_height - verticalMargin);
            } else if (this.getId() == "@I8@") {
                drawDashedGroup(view.context, myx + box_width, myy - box_height - verticalMargin, box_width, box_height, 4, "#fff", "母亲");
            }

            boxList.push([myx - 2, myy - 2, myx + w + 1, myy + h + 1, this.getId()]);
            if (this.focused) {
                defaultBoxDiv.onmouseenter = function (ev) {
                    boxMouseOver(defaultBoxDiv, [myx - 2, myy - 2, myx + w + 1, myy + h + 1, this.getId()]);
                }.bind(this);
                defaultBoxDiv.onmouseleave = function (ev) {
                    // hidePersonOption();
                }
                // selected status
                boxMouseOver(defaultBoxDiv, [myx - 2, myy - 2, myx + w + 1, myy + h + 1, this.getId()], true);
            }
        },
        drawLines: function (view) {
            for (var i = 0; i < this.descendents_down.length; i++) {
                var child = this.descendents_down[i];
                drawParentalLine(view, this, child);
            }
        },
        drawLines_2 : function(view, array) {
            for (var i=0; i<this.descendents_down.length; i++) {
                var child = this.descendents_down[i];
                if(arrayContains(array, child.getId())){
                    drawParentalLine(view, this, child);
                }
            }
        },
    }
}

var makeEmpty = function (element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}


var debug = function (msg) {
    console.log(msg);
}

var Tree = function (structure, person_id) {
    var layout = Layout(person_id, structure);
    var positioned = false;
    var nodes = flattenTree(layout.nodes);
    return {
        getTreeExtents: function () {
            return layout.getTreeExtents();
        },
        lookupNodeById: function (personid) {
            var an = layout.lookupNodeById(personid);
            if (an == null)
                return null;
            else
                return an.getInteriorNodeById(personid);
        },
        hitTest: function (view, x, y) {
            for (var i = 0; i < nodes.length; i++) {
                var tmp = nodes[i].hitTest(view, x, y);
                var hit = tmp[0]; var kind = tmp[1];
                if (hit)
                    return [nodes[i], kind];
            }
            return [null, "none"];
        },
        position: function (view) {
            layout.position(view);
        },
        draw: function (view) {
            if (!positioned) {
                positioned = true;
                this.position(view);
            }
            var recurseDraw = function (node) {
                node.draw(view);
                node.drawLines(view);
                for (var i = 0; i < node.descendents_down.length; i++)
                    recurseDraw(node.descendents_down[i])
            }
            recurseDraw(layout.nodes);
        }
    }
}

var WidgetManager = function () {
    var widgets = [];
    return {
        init: function (view) {
            widgets = [];
        },
        hitTest: function (view, mousex, mousey) {
            for (var i = 0; i < widgets.length; i++) {
                var tmp = widgets[i].hitTest(view, mousex, mousey);
                var ishit = tmp[0]; var data = tmp[1];
                if (ishit)
                    return ["widget", data];
            }
            return [null, "none"];
        },
        draw: function (view) {
            for (var i = 0; i < widgets.length; i++)
                widgets[i].draw(view);
        }
    }
}

var View = function (data) {
    structure = data["structure"];
    var findAppropriateAncestor = function (personid) {
        var getGeneration = function (p, g) {
            if (g == 0)
                return [p];
            var result = [];
            if (!(p in structure))
                return result;
            var parents = sortByGender(structure, structure[p].parents);
            for (var i = 0; i < parents.length; i++)
                result = result.concat(getGeneration(parents[i], g - 1));
            return result;
        }
        var result = null;
        for (var i = 2; i >= 0; i--) {
            var res = getGeneration(personid, i);
            if (res.length > 0) {
                result = res[0];
                break;
            }
        }
        if (result == null || !(result in structure))
            return null;
        return result;
    }
    return {
        tree: null,
        scrollx: 0,
        scrolly: 0,
        targetx: 0,
        targety: 0,
        dragging: false,
        ismousedown: false,
        lastclickposx: 0,
        lastclickposy: 0,
        lastscrollposx: 0,
        lastscrollposy: 0,
        dragtimer: null,
        canvas: null,
        context: null,
        easeAmount: 1,
        widgets: WidgetManager(),
        focusId: null,

        init_canvas: function () {
            var options = {
                // Setting this to false seems to sometimes make the background black on Chromium
                alpha: true,
            }
            this.canvas = document.getElementById("canvas");
            this.context = this.canvas.getContext("2d", options);
        },
        get_mouse_pos: function (evt) {
            var bRect = this.canvas.getBoundingClientRect();
            var mouseX = (evt.clientX - bRect.left) * (this.canvas.width / bRect.width);
            var mouseY = (evt.clientY - bRect.top) * (this.canvas.height / bRect.height);
            return [mouseX, mouseY];
        },
        get_touch_pos: function (evt) {
            if (evt.touches.length == 0) {
                return [this.lastclickposx, this.lastclickposy];
            }
            var bRect = this.canvas.getBoundingClientRect();
            var mouseX = (evt.touches[0].clientX - bRect.left) * (this.canvas.width / bRect.width);
            var mouseY = (evt.touches[0].clientY - bRect.top) * (this.canvas.height / bRect.height);
            return [mouseX, mouseY];
        },
        startDragTimer: function () {
            var mythis = this;
            if (this.dragtimer != null) {
                return;
            }
            this.dragtimer = true;
            var anim = function () {
                mythis.scrollx = mythis.scrollx + mythis.easeAmount * (mythis.targetx - mythis.scrollx);
                mythis.scrolly = mythis.scrolly + mythis.easeAmount * (mythis.targety - mythis.scrolly);
                if ((!mythis.dragging) && (Math.abs(mythis.scrollx - mythis.targetx) < 0.1)
                    && (Math.abs(mythis.scrolly - mythis.targety) < 0.1)) {
                    mythis.scrollx = mythis.targetx;
                    mythis.scrolly = mythis.targety;
                    mythis.dragtimer = null;
                }
                last_x = mythis.scrollx;
                last_y = mythis.scrolly;
                mythis.redraw();
                if (mythis.dragtimer != null)
                    requestFrame(anim);
            }
            requestFrame(anim);
        },
        makeTree: function (nodeid) {
            var anc = findAppropriateAncestor(nodeid);
            if (anc == null) {
                displayError("找不到ID为： \"" + nodeid + "\"的节点", true);
                return null;
            }
            var tree = Tree(structure, anc);
            return tree;
        },
        recreateTree: function () {
            this.setFocus(this.focusId, false);
        },
        findScreenCenter: function () {
            var left = 0;
            var top = 0;
            var right = this.canvas.width;
            var bottom = this.canvas.height;

            return { "x": left + (right - left) / 2, "y": top + (bottom - top) / 2 };
        },
        setFocus: function (node, updatehistory) {
            this.tree = this.makeTree(node);
            if (this.tree == null)
                return;
            this.focusId = node;
            if (updatehistory)
                window.location.hash = node;

            var thenode = this.tree.lookupNodeById(node);
            // if (!thenode) return;    // the code should be added !
            this.tree.position(this);

            var the_center = this.findScreenCenter();
            if(last_x==0 && last_y==0){
                this.scrollx = this.targetx = the_center.x - thenode.getX() - thenode.getWidth() / 2;
                this.scrolly = this.targety = the_center.y - thenode.getY() - thenode.getHeight() / 2;
            }else{
                this.scrollx = last_x;
                this.scrolly = last_y;
            }
            thenode.focused = true;
            this.canvas.focus();
            this.redraw();

        },
        setFocusPosition: function (node, updatehistory, x, y) {
            this.tree = this.makeTree(node);
            if (this.tree == null)
                return;
            this.focusId = node;
            if (updatehistory)
                window.location.hash = node;

            var thenode = this.tree.lookupNodeById(node);
            this.tree.position(this);
            this.scrollx = x - thenode.getX();
            this.scrolly = y - thenode.getY();
            thenode.focused = true; this.canvas.focus();
            this.redraw();

            var the_center = this.findScreenCenter();
            this.targetx = the_center.x - thenode.getX() - thenode.getWidth() / 2;
            this.targety = the_center.y - thenode.getY() - thenode.getHeight() / 2;
            this.startDragTimer();

        },
        hitTest: function (mousePos) {
            var tmp = this.widgets.hitTest(this, mousePos[0], mousePos[1]);
            var ishit = tmp[0];
            var data = tmp[1];
            if (ishit != null)
                return ["widget", data];

            var tmp = this.tree.hitTest(this, mousePos[0], mousePos[1]);
            var ishit = tmp[0];
            var data = tmp[1];
            if (ishit != null)
                return ["node", data];
            return ["none", null];
        },
        mouseup: function (buttons, mousePos) {
            var wasdragging = this.dragging;
            this.stopDragging();

            if (wasdragging) {
                return;
            }

            // click box
            for (var i = 0; i < boxList.length; i++) {
                // startX startY endX endY id
                var thisBox = boxList[i];
                if (mousePos[0] > thisBox[0] && mousePos[0] < thisBox[2] && mousePos[1] > thisBox[1] && mousePos[1] < thisBox[3]) {
                    break;
                }
            }
        },
        stopDragging: function () {
            this.dragging = false;
            this.ismousedown = false;
            this.adjustVisibleArea();
        },
        mousemove: function (buttons, mousePos) {
            //IE9
            if (window.event)
                buttons = window.event.button || buttons;
            if (buttons == 0) {
                this.stopDragging();
            }
            if (this.dragging) {
                var posx = mousePos[0] - this.lastclickposx;
                var posy = mousePos[1] - this.lastclickposy;
                this.targetx = this.lastscrollposx + posx;
                this.targety = this.lastscrollposy + posy;
                this.startDragTimer();
            } else if (this.ismousedown) {
                var dx = this.lastclickposx - mousePos[0];
                var dy = this.lastclickposy - mousePos[1];
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d > mouseClickRadius)
                    this.dragging = true;
            } else {
                //判断鼠标是否在box上
                var boxStatus = 0;
                var boxDiv = document.getElementById('boxDiv');
                for (var i = 0; i < boxList.length; i++) {
                    var thisBox = boxList[i];
                    if (mousePos[0] > thisBox[0] && mousePos[0] < thisBox[2] && mousePos[1] > thisBox[1] && mousePos[1] < thisBox[3]) {
                        boxStatus = 1;
                        boxMouseOver(boxDiv, thisBox);
                        break;
                    }
                }
                if (boxStatus == 0) {
                    boxDiv.style.display = 'none';
                    hidePersonOption();

                }
            }
        },
        mousedown: function (buttons, mousePos) {
            this.lastclickposx = mousePos[0];
            this.lastclickposy = mousePos[1];
            this.lastscrollposx = this.scrollx;
            this.lastscrollposy = this.scrolly;
            if (!this.dragging && this.hitTest(mousePos)[0] == "none") {
                this.dragging = true;
            }
            this.ismousedown = true;
        },
        set_canvas_size: function () {
            this.canvas.width = Math.min(window.outerWidth || window.innerWidth, window.innerWidth);
            this.canvas.height = Math.min(window.outerHeight || window.innerHeight, window.innerHeight);
            this.widgets.init(this);
        },
        zoomin: function () {
            var option = document.getElementById("personal_option");
            option.style.display = "none";
            if (allScalingFonts[0].getSize() > 30)
                return;
            for (var i = 0; i < allScalingFonts.length; i++) {
                var s = allScalingFonts[i].getSize();
                allScalingFonts[i].setSize(s + 1);
            }
            this.recreateTree();
        },
        zoomout: function () {
            var option = document.getElementById("personal_option");
            option.style.display = "none";
            if (allScalingFonts[0].getSize() < 5)
                return;
            for (var i = 0; i < allScalingFonts.length; i++) {
                var s = allScalingFonts[i].getSize();
                allScalingFonts[i].setSize(s - 1);
            }
            this.recreateTree();
        },
        reload_canvas: function(initial_focus){
            this.setFocus(initial_focus, false);
            this.redraw();
        },
        init: function (initial_focus) {
            var mythis = this;
            // do not add same event repeatly!

            this.init_canvas();
            this.set_canvas_size();
            this.setFocus(initial_focus, false);

            this.canvas.addEventListener("mousedown", function (evt) {
                // obviousConsole("mousedown evt:", evt);
                mythis.mousedown(evt.buttons, mythis.get_mouse_pos(evt));
            }, false);
            this.canvas.addEventListener("mouseup", function (evt) {
                mythis.mouseup(evt.buttons, mythis.get_mouse_pos(evt));
            }, false);
            this.canvas.addEventListener("mousemove", function (evt) {
                preventEvent(evt);
                mythis.mousemove(evt.buttons, mythis.get_mouse_pos(evt));
            }, false);

            this.canvas.addEventListener("touchstart", function (evt) {
                mythis.mousedown(1, mythis.get_touch_pos(evt));
                evt.preventDefault();
                evt.stopPropagation();
            }, false);
            this.canvas.addEventListener("touchend", function (evt) {
                mythis.mouseup(1, mythis.get_touch_pos(evt));
                evt.preventDefault();
                evt.stopPropagation();
            }, false);
            this.canvas.addEventListener("touchmove", function (evt) {
                mythis.mousemove(1, mythis.get_touch_pos(evt));
                evt.stopPropagation();
                evt.preventDefault();
            }, false);

            this.canvas.addEventListener("mouseenter", function (evt) {
                preventEvent(evt);
                evt.preventDefault();
            }, false);
            this.canvas.addEventListener("keydown", function (evt) {
                var newtarget = null;
                if (evt.ctrlKey || evt.altKey)
                    return;
                switch (evt.keyCode) {
                    case 173: case 189://minus
                        mythis.zoomout();
                        evt.preventDefault();
                        break;
                    case 61: case 187://plus
                        mythis.zoomin();
                        evt.preventDefault();
                        break
                    case 38: case 87: //up
                        var myself = mythis.tree.lookupNodeById(mythis.focusId);
                        if (myself.ascendents_down.length > 0)
                            newtarget = myself.ascendents_down[0];
                        else if (myself.group && myself.group.ascendents_down.length > 0)
                            newtarget = myself.group.ascendents_down[0];
                        evt.preventDefault();
                        break;
                    case 40: case 83: //down
                        var myself = mythis.tree.lookupNodeById(mythis.focusId);
                        if (myself.descendents_down.length > 0)
                            newtarget = myself.descendents_down[0];
                        else if (myself.group && myself.group.descendents_down.length > 0)
                            newtarget = myself.group.descendents_down[0];
                        evt.preventDefault();
                        break;
                    case 37: case 65: //left
                        var myself = mythis.tree.lookupNodeById(mythis.focusId);
                        var parent = null;
                        if (myself.ascendents_down.length > 0)
                            parent = myself.ascendents_down[0];
                        else if (myself.group && myself.group.ascendents_down.length > 0)
                            parent = myself.group.ascendents_down[0];
                        if (parent) {
                            var sibs = parent.descendents_down;
                            var i = sibs.indexOf(myself);
                            if (i < 0 && myself.group)
                                i = sibs.indexOf(myself.group);
                            if (i > 0)
                                newtarget = sibs[i - 1];
                        }
                        evt.preventDefault();
                        break;
                    case 39: case 68: //right
                        var myself = mythis.tree.lookupNodeById(mythis.focusId);
                        var parent = null;
                        if (myself.ascendents_down.length > 0)
                            parent = myself.ascendents_down[0];
                        else if (myself.group && myself.group.ascendents_down.length > 0)
                            parent = myself.group.ascendents_down[0];
                        if (parent) {
                            var sibs = parent.descendents_down;
                            var i = sibs.indexOf(myself);
                            if (i < 0 && myself.group)
                                i = sibs.indexOf(myself.group);
                            if (i < sibs.length - 1)
                                newtarget = sibs[i + 1];
                        }
                        evt.preventDefault();
                        break;
                    case 97:
                        // alert('添加儿子');
                        break;
                    case 98:
                        // alert('添加女儿');
                        break;
                }
                if (newtarget != null) {
                    mythis.setFocusPosition(newtarget.getId(), true, newtarget.getX() + mythis.scrollx, newtarget.getY() + mythis.scrolly);
                }
            }, false);
            window.addEventListener("resize", function (evt) {
                mythis.set_canvas_size();
                mythis.adjustVisibleArea();
                mythis.redraw();
            }, false);
            window.addEventListener("hashchange", function (evt) {
                var myhash = getHashString();
                if (myhash == "")
                    myhash = initial_focus;
                if (mythis.focusId == myhash)
                    return;
                mythis.setFocus(myhash, false);
            });
        },
        adjustVisibleArea: function () {
            var changed = false;
            var extents = this.tree.getTreeExtents();
            if (extents[2] + this.scrollx < 0) {
                this.targetx = this.canvas.width / 2 - extents[2];
                changed = true;
            }
            if (extents[3] + this.scrolly < 0) {
                this.targety = this.canvas.height / 2 - extents[3];
                changed = true;
            }
            if (extents[0] + this.scrollx > this.canvas.width) {
                this.targetx = this.canvas.width / 2 + extents[0];
                changed = true;
            }
            if (extents[1] + this.scrolly > this.canvas.height) {
                this.targety = this.canvas.height / 2 - extents[1];
                changed = true;
            }

            if (changed)
                this.startDragTimer();

        },
        redraw: function () {
            boxList = [];
            canvasView = this;
            var boxDiv = document.getElementById('boxDiv');
            boxDiv.style.display = 'none';
            document.getElementById("photos").innerHTML = '';
            this.context.clearRect(0, 0, canvas.width, canvas.height);
            if (this.tree != null)
                this.tree.draw(this);
            this.widgets.draw(this);
        },
    }
}

var getHashString = function () {
    var myhash = window.location.hash;
    if (myhash[0] == "#")
        myhash = myhash.substr(1);
    return decodeURIComponent(myhash);
}

var requestFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var boxMouseOver = function (e, thisBox, init) {
    var scale = allScalingFonts[0].getSize() / defaultFontSize;

    e.style.top = thisBox[1] + 0 + "px";
    e.style.left = thisBox[0] + 0 + "px";

    e.style.borderRadius = 5 * scale + "px";
    e.style.webkitBorderRadius = 5 * scale + "px";
    e.style.msBorderRadius = 5 * scale + "px";
    e.style.oBorderRadius = 5 * scale + "px";
    e.style.mozBorderRadius = 5 * scale + "px";
    e.style.display = '';
    e.style.width = (thisBox[2] - thisBox[0] - 5) + 'px';
    e.style.height = (thisBox[3] - thisBox[1] - 5) + 'px';
    if (init) return;
    
    var defaultBoxDiv = document.getElementById("defaultBoxDiv"),
    	_boxDiv = document.getElementById("boxDiv");
    defaultBoxDiv.onclick = function () {
    	showProfile(thisBox[4]);
    }
    _boxDiv.onclick = function () {
    	showProfile(thisBox[4]);
    }

    // scale style of personal_option and its children
    var option = document.getElementById("personal_option"),
        gap = option.getElementsByClassName("gap")[0],
        arrow = gap.getElementsByClassName("arrow")[0],
        btns = option.getElementsByClassName("btns")[0],
        iconDiv = btns.getElementsByClassName("icon");

    option.style.width = 52 * scale + "px";
    option.style.height = (thisBox[3] - thisBox[1] - 3) + "px";

    gap.style.width = 12 * scale + "px";
    gap.style.height = (thisBox[3] - thisBox[1] - 3) + "px";    // 156 * scale + "px"
    arrow.style.borderWidth = 12 * scale + "px";
    arrow.style.top = 18 * scale + "px";
    arrow.style.left = -10 * scale + "px";

    btns.style.width = 40 * scale + "px";
    btns.style.height = (thisBox[3] - thisBox[1] - 3) + "px";   // 156 * scale + "px"
    for (var i = 0; i < iconDiv.length; i++) {
        var curIcon = iconDiv[i],
            textDiv = curIcon.getElementsByTagName("div")[0];

        curIcon.style.width = 41 * scale + 'px';
        curIcon.style.height = (thisBox[3] - thisBox[1] - 3) / 3 + 'px';

        var backgroundSize = 14 * scale + 'px';
        if (i == 1) {
            backgroundSize = 13 * scale + 'px';
        }
        curIcon.style.backgroundSize = backgroundSize;

        textDiv.style.height = 22 * scale + "px";
        textDiv.style.fontSize = 14 * scale + "px";
        textDiv.style.bottom = 0.05 * scale + "px";

        if (14 * scale < 12) {
            textDiv.style.transform = "scale(" + scale + ")";
            textDiv.style.webkitTransform = "scale(" + scale + ")";
            textDiv.style.mozTransform = "scale(" + scale + ")";
            textDiv.style.msTransform = "scale(" + scale + ")";
            textDiv.style.oTransform = "scale(" + scale + ")";
        }

    }

    option.style.left = thisBox[2] - 1 + 'px';  // -1 offset
    option.style.top = thisBox[1] + 2 + 'px';
    option.style.display = "block";

    $("#editButton").attr("onclick","openEdit("+thisBox[4]+");");
    $("#addButton").attr("onclick","showBg("+thisBox[4]+");");
    $("#relButton").attr("onclick","reload("+thisBox[4]+");");

}

var hidePersonOption = function () {
    var option = document.getElementById("personal_option");
    option.style.display = "none";
}

function preventEvent(evt) {
    if (evt && evt.stopPropagation) {
        // this code is for Mozilla and Opera
        evt.stopPropagation();
    } else if (window.event) {
        // this code is for IE
        window.event.cancelBubble = true;
    }
}

function fadeOut(el, step) {
    el.style.opacity = 1;
    step = step || 0.15;
    (function fade() {
        if ((el.style.opacity -= step) < 0) {
            el.style.display = "none";
            el.style.opacity = 0;
        } else {
            requestFrame(fade);
        }
    })();
}

var initSearch = function (view) {
    document.getElementById("zoomin").onclick = function (evt) {
        view.zoomin();
    }
    document.getElementById("zoomout").onclick = function (evt) {
        view.zoomout();
    }
}

var browserOkay = function () {
    var okay = true;
    if (!XMLHttpRequest) {
        okay = false;
    }
    else if (!(new XMLHttpRequest).addEventListener) {
        okay = false;
    }
    if (!Object.keys) {
        okay = false;
    }
    if (!document.createElement('canvas').getContext) {
        okay = false;
    }
    if (!JSON) {
        okay = false;
    }
    return okay;
}

var main = function () {
    var loadingwindow = document.getElementById("loadingwindow");
    if (!browserOkay()) {
        loadingwindow.style.display = "none";
        displayError("您的浏览器版本太老，推荐使用IE8+以上、火狐浏览器或者谷歌浏览器", true);
        return;

    }
    loadData(function (data) {
        console.log('data',data);
        fadeOut(loadingwindow);
        if (data == null) {
            displayError("加载出现异常，请确认您的网络是否正常", true);
            return;
        }
        // init View => make Tree => init Layout
        var view = View(data);
        initSearch(view);

        var first_person = getHashString() || initial_person;
        view.init(first_person);
        canvasView.zoomout();
        canvasView.zoomout();
    });
}

//重新加载, structure_raw_url要加随机参数才会有效
function reLoadData() {
	$("#personal_option").hide();
    loadData(function (data) {
        fadeOut(loadingwindow);
        if (data == null) {
            displayError("加载出现异常，请确认您的网络是否正常", true);
            return;
        }
        structure = data["structure"];
        var first_person = initial_person;
        canvasView.reload_canvas(first_person);
    });
}

$(document).on("mousewheel DOMMouseScroll", function (e) {
    var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
        (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1));              // firefox

    var proLeft = $("#profiesrlls").offset().left;
    var proWid = $("#profiesrlls").width();
    // var common = $("#common-nav-bar").height();
    if(proLeft == 0){
        if(e.clientX > proWid){
            if (delta > 0) {
                // 向上滚
                canvasView.zoomin();
            } else if (delta < 0) {
                // 向下滚
                canvasView.zoomout();
            }
        }

    }else {
        if (delta > 0) {
            // 向上滚
            canvasView.zoomin();
        } else if (delta < 0) {
            // 向下滚
            canvasView.zoomout();
        }
    }
});