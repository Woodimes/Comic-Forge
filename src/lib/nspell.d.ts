/* Minimal ambient types for nspell (the package ships no types). */
declare module "nspell" {
  interface NSpellInstance {
    /** Whether `word` is correctly spelled according to the dictionary. */
    correct(word: string): boolean;
    /** Ranked list of spelling suggestions for `word`. */
    suggest(word: string): string[];
    spell(word: string): boolean;
    add(word: string): this;
    remove(word: string): this;
    dictionary(): Array<{ aff?: string; dic: string }>;
    personal(): string[];
    wordCharacters(): string;
  }
  function nspell(aff: string, dic: string): NSpellInstance;
  export = nspell;
}