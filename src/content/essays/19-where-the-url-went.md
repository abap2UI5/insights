---
title: "Where the URL Went"
number: 19
part: day
blurb: "F5, the back button and the bookmark"
description: "SAP GUI had no URL. A browser has three buttons the GUI never had - reload, back and the address bar - and in abap2UI5 the app decides how much of itself the URL carries: nothing by default, the app state, or a route per app."
---

SAP GUI had no address bar. A transaction code started a program, the OK code
moved it along, and nobody ever bookmarked screen 200 of `VA02` with order
4711 open in it — there was nothing to bookmark.

The browser hands the user three buttons the GUI never had: reload, back, and
the address bar. Every one of them is pressed in the first week, usually in
that order, and the honest first answer is what each of them does by default.

**Nothing in the URL, by default.** The framework leaves the hash alone. A
reload sends a request without a draft id, so the app named by `?app_start=`
starts fresh — `check_on_init( )` is true again, and whatever the user typed
is gone. Back leaves the abap2UI5 page altogether, the way it leaves any page.
That default is the one that never surprises anybody, and for a monitor, a
report or a one-screen tool it is also the right one.

For anything a user works *in*, the app writes itself into the URL — in one of
three ways, and only one per app, because each claims the whole hash.

**The app state: reload and bookmark restore the screen.** One call, usually
where the view is first displayed:

```abap
    IF client->check_on_navigated( ).
      client->app_state_set_active( ).
      view_display( ).
    ENDIF.
```

From then on the URL carries `#/z2ui5-xapp-state=<id>`, and the id advances
on every roundtrip. A reload, a bookmark or the link pasted into another tab
comes back to exactly this screen: every value typed, the row selected, the
tab open. Nothing extra is stored for it — the id is the draft the framework
writes after every request anyway
([#11](/insights/11-a-new-instance-on-every-request/)), so the link lives as
long as the draft does, four hours by default
([#26](/insights/26-100-rows-four-hours-one-request/)), and belongs to the user
who made it: opened by somebody else, or after it expired, the app starts
fresh with a toast that says so. `client->app_state_get_href( )` composes the
absolute link, launchpad shell included, for a *Share* button or a QR code.

A restored state arrives in `main( )` the way a return from a sub-app does —
`check_on_navigated( )` true, `check_on_init( )` not — so the rule from
[#7](/insights/07-one-click-one-request/) covers it: a return owes a view.

**Hash routing: back walks the stack.** Switched on with
`client->follow_up_action( client->cs_event-hash_routing )`, the URL mirrors
the running app as `#/app/<CLASS>/<DRAFT>`, `nav_app_call( )` pushes a history
entry, and the browser's back button returns to the caller — the stack of
[#18](/insights/18-call-screen-leave-screen/), driven by the button users
press anyway. The mode `cs_nav_mode-fresh` keeps only the class in the route,
for apps where a bookmark should open the app and not the afternoon's input.

**An app-owned hash** is the third way, for an app with routes of its own —
tabs, a detail view inside one class: `hash_set( )` writes the hash, and once
`cs_event-hash_attach_changed` has registered an event, a back button or an
edited URL raises it, with the hash in `client->get( )-s_config-hash`.

**The deep link.** `?app_start=zcl_order_display` starts a class, and the rest
of the query string is the app's: `client->get( )-s_config-search` carries it
raw, and a launchpad tile's startup parameters arrive in
`client->get( )-t_comp_params` ([#29](/insights/29-a-tile-like-any-other/)).
Both are typed by whoever holds the link, which makes them user input — an app
that opens order 4711 because the URL said so checks that this user may see
4711 ([#38](/insights/38-what-the-client-can-send/)).

The details, with the cases that combine with the launchpad, are on
[App State](https://abap2ui5.github.io/docs/cookbook/event_navigation/navigation/app_state)
and [Hash Routing](https://abap2ui5.github.io/docs/cookbook/event_navigation/navigation/hash).

The GUI had no URL to forget. The browser has one, and the app decides how
much of itself to write into it.
