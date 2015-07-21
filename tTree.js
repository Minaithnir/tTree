// tTree plugin declaration
(function ($) {

    // Plugin function that create the open icon
    function openIcon(icon) {
        return '<i style="cursor:pointer" class="tTreeOpen fa fa-' + icon + '"></i> ';
    }

    // Plugin function that create the close icon
    function closeIcon(icon) {
        return '<i style="cursor:pointer" class="tTreeClose fa fa-' + icon + '"></i> ';
    }

    // Plugin function that return the childrens of a node 
    function childrens(elem) {
        var nodeId = elem.data("tt-node");
        var table = elem.closest("table");
        return table.find("[data-tt-parent='" + nodeId + "']");
    }

    // Plugin function that return if a node has childrens
    function isLeaf(elem) {
        var childs = childrens(elem);
        return childs.length === 0;
    }

    function siblings(elem) {
        var pNodeId = elem.data("tt-parent");
        var table = elem.closest("table");
        return table.find("[data-tt-parent='" + pNodeId + "']");
    }

    function rootNodes(elem) {
        var table = elem.closest("table");
        return table.find("[data-tt-node]").not("[data-tt-parent]");
    }

    // Plugin function that closes an element
    function close(elem, settings, isTarget) {
        if (isTarget == undefined)
            isTarget = true;

        // Make sure elem is a single entity
        if (elem == undefined || elem.length > 1)
            return;

        // Close node
        if(!isTarget)
            elem.hide();

        // Close childNodes
        if (!isLeaf(elem)) {
            if (isTarget || settings.children === "close") {
                elem.find(".tTreeClose").replaceWith(openIcon(settings.iconOpen));
                elem.removeClass("tt-opened");
            }
            var childNodes = childrens(elem);
            childNodes.each(function() {
                close($(this), settings, false);
            });
        }
    }

    // Plugin function that opens an element
    function open(elem, settings, isTarget, parentOnly) {
        if (isTarget == undefined)
            isTarget = true;
        if (parentOnly == undefined)
            parentOnly = false;

        // If singleton mode close all nodes
        if (settings.accordion === "single" && isTarget) {
            var rNodes = rootNodes(elem);
            rNodes.each(function () {
                close($(this), settings);
            });

            // Reopen siblings
            var sNodes = siblings(elem);
            sNodes.each(function () {
                open($(this), settings, false);
            });
        }

        // Make sure elem is a single entity
        if (elem == undefined || elem.length > 1)
            return;

        // Make sure parents are opened
        var pNodeId = elem.data("tt-parent");
        if (pNodeId != undefined && pNodeId !== "") {
            var pNode = elem.closest("table").find('[data-tt-node="' + pNodeId + '"]');
            if (pNode != undefined && !pNode.hasClass("tt-opened")) {
                open(pNode, settings, false, true);
            }
        }

        var leaf = isLeaf(elem);
        // Open node
        elem.show();

        if (!leaf) {    
            // Open the single node if needed
            if (parentOnly === false) {
                var childNodes = childrens(elem);
                if (isTarget) {
                    elem.addClass("tt-opened");
                    elem.find(".tTreeOpen").replaceWith(closeIcon(settings.iconClose));

                    $.each(childNodes, function(i, node) {
                        open($(node), settings, false);
                    });

                } else if (settings.children === "keep" && elem.hasClass("tt-opened")) {
                    $.each(childNodes, function (i, node) {
                        open($(node), settings, false);
                    });
                } else if (settings.open === "single" && siblings(elem).length === 1) { // Open the single node
                    elem.addClass("tt-opened");
                    elem.find(".tTreeOpen").replaceWith(closeIcon(settings.iconClose));
                    open(childNodes.first(), settings, false);
                }
            } else {
                elem.addClass("tt-opened");
                elem.find(".tTreeOpen").replaceWith(closeIcon(settings.iconClose));
            }
        }
    }

    // Plugin with options
    $.fn.tTree = function (options) {

        // Load settings
        var settings = $.extend({}, $.fn.tTree.defaults, options);

        // Initiate tTree
        return this.filter("table").each(function () {
            var table = $(this);

            // List of nodes with childs
            var parentNodesIds = [];
            var parentNodes = [];
            table.find("tr[data-tt-parent]").each(function () {
                var pNodeId = $(this).data("tt-parent");
                if (!($.inArray(pNodeId, parentNodesIds) > -1)) {
                    parentNodesIds.push(pNodeId);
                    $('[data-tt-node="' + pNodeId + '"]').each(function () {
                        parentNodes.push($(this));
                    });
                }
            });


            if (settings.open === "all") {
                // Add open icons on parents nodes
                $.each(parentNodes, function (i, node) {
                    $(node).find("td:first-child").prepend(closeIcon(settings.iconClose));
                });
            } else {
                // Add open icons on parents nodes
                $.each(parentNodes, function(i, node) {
                    $(node).find("td:first-child").prepend(openIcon(settings.iconOpen));
                });

                // Hide child nodes and leafs
                table.find("[data-tt-parent]").hide();

                var rootNodes = table.find("[data-tt-node]").not("[data-tt-parent]");
                // Open the single node if needed
                if (settings.open === "single" && rootNodes.length === 1) { // Open the single node
                    open(rootNodes.first(), settings);
                }
                    // Open default node if provided
                else if (settings.defaultNode !== "") {
                    open($("[data-tt-node='" + settings.defaultNode + "']"), settings);
                }
            }

            // Attach events
            table.on("click", ".tTreeOpen", function () {
                open($(this).closest("tr[data-tt-node]"), settings);
            });

            table.on("click", ".tTreeClose", function () {
                close($(this).closest("tr[data-tt-node]"), settings);
            });

            return this;
        });
    };

    // Defaults options
    $.fn.tTree.defaults = {
        accordion: "single", // single / multiples
        open: "single", // none / single / all
        defaultNode: "", // <nodeId>
        children: "close", // close/keep
        iconOpen: "plus", // plus
        iconClose: "minus" // minus
    };
}(jQuery));
