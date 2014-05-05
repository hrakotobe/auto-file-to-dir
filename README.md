# autoFileToDir v0.0.1

Batch group files with a number at the end into directories matching the common name.

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
- -n dry-run, to see the files and directories to be processed without changing anything

# Disclaimer

This is a "scratch my itch" project in its very early version. Have a good backup if you intend to try it.

# License

BSD