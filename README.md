# Office Converter

Convert office files to various formats

> ✅ Supports wide range of input formats, including all Microsoft Office formats
> 
> ✅ Supports wide range of output formats, including PDF
> 
> ✅ Converts multiple files at once

## Some use cases
- You have a bunch of `.docx`, `.pptx`, or `.xlsx` files and you want to convert them to PDF.
- You have a `.doc` file and you want to convert it to `.docx`.
- You have a `.odt` file and you want to convert it to `.html`.
- and just about any other conversion you can think of...

## Getting Started

This extension supports multiple backends for file conversion. The requirements for each one are listed below:

### Backends

#### LibreOffice
You **must have LibreOffice installed** in your system. [Download it here](https://www.libreoffice.org/download/download-libreoffice/).
If you've already installed it normally (LibreOffice is placed in your Applications folder), you're good to go!

#### Docling
```shell
pip install docling
pip install ocrmac
```

#### MarkItDown
```shell
pip install 'markitdown[all]'
```

## Commands

### Convert Files
- Converts all selected files to the specified format.
- You must enter the format you want to convert the files to.
- The converted files will be saved in the same directory as the original files, with the same name.
- Optionally, you can specify the path of the input file.

### Convert to PDF
- Converts all selected files to PDF format.
