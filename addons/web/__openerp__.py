{
    'name': 'Web',
    'category': 'Hidden',
    'description':
        """
OpenERP Web core module.
========================

This module provides the core of the OpenERP Web Client.
        """,
    'depends': [],
    'auto_install': True,
    'post_load': 'wsgi_postload',
    'js' : [
        "static/lib/datejs/globalization/en-US.js",
        "static/lib/datejs/core.js",
        "static/lib/datejs/parser.js",
        "static/lib/datejs/sugarpak.js",
        "static/lib/datejs/extras.js",
        "static/lib/jquery/jquery-1.7.2.js",
        "static/lib/jquery.MD5/jquery.md5.js",
        "static/lib/jquery.form/jquery.form.js",
        "static/lib/jquery.validate/jquery.validate.js",
        "static/lib/jquery.ba-bbq/jquery.ba-bbq.js",
        "static/lib/spinjs/spin.js",
        "static/lib/jquery.autosize/jquery.autosize.js",
        "static/lib/jquery.blockUI/jquery.blockUI.js",
        "static/lib/jquery.ui/js/jquery-ui-1.8.17.custom.min.js",
        "static/lib/jquery.ui.timepicker/js/jquery-ui-timepicker-addon.js",
        "static/lib/jquery.ui.notify/js/jquery.notify.js",
        "static/lib/jquery.deferred-queue/jquery.deferred-queue.js",
        "static/lib/jquery.scrollTo/jquery.scrollTo-min.js",
        "static/lib/jquery.tipsy/jquery.tipsy.js",
        "static/lib/jquery.textext/jquery.textext.js",
        "static/lib/jquery.timeago/jquery.timeago.js",
        "static/lib/qweb/qweb2.js",
        "static/lib/underscore/underscore.js",
        "static/lib/underscore/underscore.string.js",
        "static/lib/backbone/backbone.js",
        "static/lib/cleditor/jquery.cleditor.js",
        "static/lib/py.js/lib/py.js",        
        "static/src/js/boot.js",
        "static/src/js/corelib.js",
        "static/src/js/coresetup.js",
        "static/src/js/dates.js",
        "static/src/js/formats.js",
        "static/src/js/chrome.js",
        "static/src/js/views.js",
        "static/src/js/data.js",
        "static/src/js/data_export.js",
        "static/src/js/search.js",
        "static/src/js/view_form.js",
        "static/src/js/view_list.js",
        "static/src/js/view_list_editable.js",
        "static/src/js/view_tree.js",
    ],
    'css' : [
        "static/lib/jquery.ui.bootstrap/css/custom-theme/jquery-ui-1.8.16.custom.css",
        "static/lib/jquery.ui.timepicker/css/jquery-ui-timepicker-addon.css",
        "static/lib/jquery.ui.notify/css/ui.notify.css",
        "static/lib/jquery.tipsy/tipsy.css",
        "static/lib/jquery.textext/jquery.textext.css",
        "static/src/css/base.css",
        "static/src/css/data_export.css",
        "static/lib/cleditor/jquery.cleditor.css",
    ],
    'qweb' : [
        "static/src/xml/*.xml",
    ],
}
