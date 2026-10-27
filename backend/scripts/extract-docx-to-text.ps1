Add-Type -AssemblyName System.IO.Compression.FileSystem

function Extract-DocxText($docxPath, $outTxtPath) {
    Write-Host "Extracting from $docxPath -> $outTxtPath"
    $zip = [System.IO.Compression.ZipFile]::OpenRead($docxPath)
    $entry = $zip.GetEntry("word/document.xml")
    if ($entry -ne $null) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $xml = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()

        # Replace paragraph endings with newlines
        $xml = [regex]::Replace($xml, '</w:p>', "`n")
        $xml = [regex]::Replace($xml, '<w:tab/>', "`t")
        $xml = [regex]::Replace($xml, '<[^>]+>', '')
        # Decode XML entities
        $text = [System.Net.WebUtility]::HtmlDecode($xml)

        [System.IO.File]::WriteAllText($outTxtPath, $text, [System.Text.Encoding]::UTF8)
        Write-Host "Extracted $(($text -split "`n").Length) lines."
    }
    $zip.Dispose()
}

Extract-DocxText "Astronomy_and_Mathematical_Astrology_Full_Study_Notes.docx" "backend/scripts/extracted_study_notes.txt"
Extract-DocxText "Astronomy_and_Mathematical_Astrology_Full_OCR_Extraction.docx" "backend/scripts/extracted_ocr.txt"
