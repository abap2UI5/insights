---
title: "One App, Many Systems"
number: 31
order: 31
part: where
blurb: "several S/4 systems behind one app, and the boundary the app draws"
description: "One side-by-side abap2UI5 app on the BTP ABAP Environment serving several S/4 systems - what makes it possible, and the tenant boundary the app has to enforce itself."
---

A side-by-side app ([#30](/insights/30-on-stack-or-side-by-side/))
already runs outside the system it serves. How many systems can it serve?

More than one. The app lives on the SAP BTP ABAP Environment and reaches each
S/4 system through its released APIs, so the connection is configuration rather
than code.

![One abap2UI5 app on the SAP BTP ABAP Environment serves several S/4HANA systems through their released APIs](/insights/use_cases/saas.svg)

Nothing was added to make this possible. It works because of what the earlier
articles already established. The frontend is a shell that renders whatever
arrives, so it does not care which system produced it. The app is one class
with no artifacts beside it, so there is nothing per system to deploy. And the
state that makes a roundtrip work is a draft row the request names by its id,
so no server holds a session belonging to one system.

The limits are the ones the shape implies. Every system needs its released
APIs reachable, and latency is now on the wire.

## The boundary the framework does not draw

One app now sees several systems, and nothing in abap2UI5 knows that. What the
framework scopes, it scopes to the **user**: the draft row carries `sy-uname`
and is read back only for that user, the instance is created fresh per request
([#9](/insights/09-a-new-instance-on-every-request/)), and the draft
table is client-dependent like any other, so `sy-mandt` separates clients of
the BTP system — not the S/4 systems behind it.

Which S/4 system a request is about is therefore a value the app holds: an
attribute of the instance, set when the user chose the system or when the
launchpad parameter named it (`client->get( )-t_comp_params`, which is
[user input](https://abap2ui5.github.io/docs/configuration/authorization#startup-parameters-are-user-input)).
That attribute is serialized with the instance like every other one, travels
to the browser if it is bound, and is passed along by `nav_app_call( )` only
if the caller puts it into the sub-app it constructs. So the check belongs
where the remote call is made: every read and every write names the system
key from the instance, and the app verifies that *this* user may address
*that* system before it does. The ABAP authorization concept was not asked to
carry this, because it does not know the systems exist.
