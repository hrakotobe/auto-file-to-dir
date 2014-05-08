auto-file-to-dir
================

Command line utility to batch organise numbered files into folders:

*before:*

- [baz]fooBar 1 (buzz).txt
- [baz]fooBar 2 (buzz).txt
- [baz]fooBar 3 (buzz).txt
- [baz]fooBar 4 (buzz).txt

*after:*

<<<<<<< HEAD
- fooBar
    - [baz]fooBar 1 (buzz).txt
    - [baz]fooBar 2 (buzz).txt
    - [baz]fooBar 3 (buzz).txt
    - [baz]fooBar 4 (buzz).txt
=======
-> auto-file-to-dir 

- fooBar
    -  fooBar 1.txt
    -  fooBar 2.txt
    -  fooBar 3.txt
    -  fooBar 4.txt
>>>>>>> 880dec0b6c40185f74da63dbd60efbfd910433fc

# Requirements

This is a node based command line tool.

# Options

--help will show the full list of implemented options.

The main ones are:

- -v for verbose output
- -n to see the files and directories to be processed without changing anything (dry-run)

# Disclaimer

This is a "scratch my itch" project in its very early version. Have a good backup if you intend to try it.
