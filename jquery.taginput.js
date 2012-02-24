(function($) {
    $.fn.tagInput = function(options) {
        var opt = $.extend({
                cls: "tag_input"
            },
            options);

        var dragObj = null;
        var dragObjStartPoint = null;

        var src = this;
        var cls = opt.cls;

        var value = src.val();
        src.addClass("hidden");

        var editor = $("<div/>", {
            "class": cls,
            click: function() {
                $("." + cls + " input").focus();
            }
        });

        var tokens = $("<div/>", {
            "class": "tokens"
        }).appendTo(editor);

        var wrap = $("<div/>", {
            "class": "wrap"
        });

        var input = $("<input/>", {
            type: "text",
            blur: function() {
                insertTag($(this).val());
                updateSource();
            },
            keydown: function(event) {
                if ((event.keyCode == 8) && !$(this).val()) {
                    var tags = $("." + cls + " .token");
                    if (tags && tags.length && tags[tags.length - 1]) {
                        removeTag($(tags[tags.length - 1]));
                    }
                }
            }
        }).appendTo(wrap);

        wrap.appendTo(editor);

        src.after(editor);

        function updateSource() {
            var val = "";

            $("." + cls + " .tag").each(function(index, obj) {
                val += (val ? "," : "") + $(obj).text();
            });

            src.val(val);
        }

        function removeTag(tag) {
            tag.remove();
            updateSource();
        }

        function insertTag(name) {
            name = name.replace(/[",#]/g, '').replace(/</g, "&lt;");
            if (name.replace(/,/g, '')) {
                input.val("");

                var token = $("<div/>", {
                    "class": "token label",
                    mousedown: function(event) {
                        event.preventDefault();

                        dragObj = $(this);
                        dragObj.css({
                            position: "relative",
                            left: 0,
                            cursor: "move"
                        });
                        dragObj.addClass("draggable");

                        dragObjStartPoint = {x: event.pageX, y: event.pageY};
                    }
                });

                $("<span/>", {
                    "class": "tag",
                    text: name
                }).appendTo(token);

                $("<span/>", {
                    title: "Remove",
                    "class": "close",
                    text: "x",
                    click: function() {
                        removeTag($(this).parent());
                    }
                }).appendTo(token);

                token.appendTo(tokens);
            }
        }

        function checkUserInput() {
            var val = input.val();
            if ((val != '"' && val.match(',')) || (val == '"' && val.substr( - 2) == '",')) {
                insertTag(val.replace(/(",$)|(,$)/, '').replace('"', ''));
                updateSource();
            }
        }

        var tags = [];

        var match;
        while (match = value.match(/"(.*?)"/m)) {
            value = value.replace(match[0], '');
            tags[tags.length] = match[1]
        }

        $.each(value.split(','), function(index, value) {
            value = value.replace(/^\s+|\s+$/g, "");
            if (value) {
                tags[tags.length] = value;
            }
        });

        $.each(tags, function(index, value) {
            insertTag(value);
        });

        var timer = setInterval(checkUserInput, 100);

        $(document).mouseup(function() {
            if (dragObj != null) {
                dragObj.removeClass("draggable");
                dragObj.css({
                    position: "static",
                    left: 0,
                    cursor: "default"
                });
            }

            dragObj = null;
            dragObjStartPoint = null;
        });

        $(document).mousemove(function(event) {
            var update = false;
            if ((dragObj != null) && (dragObjStartPoint != null)) {
                var target = null;

                var delta = event.pageX - dragObjStartPoint.x;
                if (delta > 0) {
                    target = dragObj.next();
                } else {
                    target = dragObj.prev();
                }

                if (target != null) {
                    dragObj.css({
                        left: delta
                    });

                    var threshold = target.width() / 2;
                    if (delta > threshold) {
                        target.after(dragObj);
                        update = true;
                    } else if (delta < -1 * threshold) {
                        target.before(dragObj);
                        update = true;
                    }

                    if (update) {
                        $(document).mouseup();
                        updateSource();
                    }
                }
            }
        });
    };
})(jQuery);
