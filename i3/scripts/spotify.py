#!/usr/bin/python

import dbus
try:
	bus = dbus.SessionBus()
	spotify = bus.get_object("org.mpris.MediaPlayer2.spotify", "/org/mpris/MediaPlayer2")
	spotify_iface = dbus.Interface(spotify, 'org.freedesktop.DBus.Properties')
	props = spotify_iface.Get('org.mpris.MediaPlayer2.Player', 'Metadata')
	concat =str(props['xesam:artist'][0]) + " - " + str(props['xesam:title'])
	l = 50
	if len(concat) > l:
		print(concat[:l-3],'...')
	else:
		print(concat)
	exit
except dbus.exceptions.DBusException:
	exit