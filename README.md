auto-file-to-dir
================

Command line utility to batch organise numbered files into folders:

i.e.:
- fooBar 1.txt
- fooBar 2.txt
- fooBar 3.txt
- fooBar 4.txt

-> 
- fooBar
--  fooBar 1.txt
--  fooBar 2.txt
--  fooBar 3.txt
--  fooBar 4.txt

# Requirements

This is a node based command line tool.

# Options

--help will show the full list of implemented options.

The main ones are:

- -v for verbose output
- -n to see the files and directories to be processed without changing anything (dry-run)

# Disclaimer

This is a "scratch my itch" project in its very early version. Have a good backup if you intend to try it.
