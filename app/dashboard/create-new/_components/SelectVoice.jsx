"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SelectVoice({ onUserSelect }) {
  return (
    <div className="mt-7">
      <h2 className="font-bold text-2xl text-primary">Voice</h2>
      <p className="text-gray-500">Select your video voice</p>

      <Select
        onValueChange={(value) => {
          onUserSelect("voice", value);
        }}
      >
        <SelectTrigger className="w-full mt-2 p-6 text-lg">
          <SelectValue placeholder="Select Voice" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>English</SelectLabel>
            <SelectItem value="en-AU-NatashaNeural - en-AU (Female)">
              Natasha (Female - AU)
            </SelectItem>
            <SelectItem value="en-AU-WilliamNeural - en-AU (Male)">
              William (Male - AU)
            </SelectItem>
            <SelectItem value="en-CA-ClaraNeural - en-CA (Female)">
              Clara (Female - CA)
            </SelectItem>
            <SelectItem value="en-CA-LiamNeural - en-CA (Male)">
              Liam (Male - CA)
            </SelectItem>
            <SelectItem value="en-IN-NeerjaNeural - en-IN (Female)">
              Neerja (Female - IN)
            </SelectItem>
            <SelectItem value="en-IN-PrabhatNeural - en-IN (Male)">
              Prabhat (Male - IN)
            </SelectItem>
            <SelectItem value="en-US-AvaNeural - en-US (Female)">
              Ava (Female - US)
            </SelectItem>
            <SelectItem value="en-US-AndrewNeural - en-US (Male)">
              Andrew (Male - US)
            </SelectItem>
            <SelectItem value="en-GB-SoniaNeural - en-GB (Female)">
              Sonia (Female - GB)
            </SelectItem>
            <SelectItem value="en-GB-RyanNeural - en-GB (Male)">
              Ryan (Male - GB)
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Hindi</SelectLabel>
            <SelectItem value="hi-IN-SwaraNeural - hi-IN (Female)">
              Aditi (Female)
            </SelectItem>
            <SelectItem value="hi-IN-MadhurNeural - hi-IN (Male)">
              Rohan (Male)
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Korean</SelectLabel>
            <SelectItem value="ko-KR-SunHiNeural - ko-KR (Female)">
              SunHi (Female)
            </SelectItem>
            <SelectItem value="ko-KR-InJoonNeural - ko-KR (Male)">
              InJoon (Male)
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Japanese</SelectLabel>
            <SelectItem value="ja-JP-NanamiNeural - ja-JP (Female)">
              Nanami (Female)
            </SelectItem>
            <SelectItem value="ja-JP-KeitaNeural - ja-JP (Male)">
              Keita (Male)
            </SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>German</SelectLabel>
            <SelectItem value="de-DE-KatjaNeural - de-DE (Female)">
              Katja (Female - DE)
            </SelectItem>

            <SelectItem value="de-DE-ConradNeural - de-DE (Male)">
              Conrad (Male - DE)
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export default SelectVoice;
