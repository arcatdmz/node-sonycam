import { XMLParser } from "fast-xml-parser";
import fetch from "node-fetch";
import { SonyCamSpec } from "./SonyCamSpec";

const parser = new XMLParser();

/**
 * Fetch Sony camera device description and parse results.
 *
 * @param location - UPnP Device Description location (url)
 * @returns Camera spec
 */
export async function fetchSonyCamSpec(location: string): Promise<SonyCamSpec> {
  const res = await fetch(location);
  const text = await res.text();
  return parser.parse(text).root;
}
