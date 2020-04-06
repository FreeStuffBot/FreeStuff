
const TOKEN_VARIABLE_OPEN = '=';
const TOKEN_VARIABLE_CLOSE = '=';
const TOKEN_CONDITIONAL_OPEN = '{';
const TOKEN_CONDITIONAL_CLOSE = '}';
const TOKEN_CONDITIONAL_BOOLEAN = '?';
const TOKEN_CONDITIONAL_ELSE = '%ELSE%';


export default function parse(template: string, data: any) {

  // parse conditional garbage
  template = template.split(TOKEN_CONDITIONAL_CLOSE + TOKEN_CONDITIONAL_OPEN).join(TOKEN_CONDITIONAL_ELSE);
  let out = '';
  let split = template.split(TOKEN_CONDITIONAL_OPEN);
  out += split.splice(0, 1)[0];
  for (const part of split) {
    if (!part.includes(TOKEN_CONDITIONAL_CLOSE)) {
      out += part;
      continue;
    }

    let conditional = part.split(TOKEN_CONDITIONAL_CLOSE)[0];
    const constant = part.substr(conditional.length + TOKEN_CONDITIONAL_CLOSE.length);

    blockloop:
    for (let block of conditional.split(TOKEN_CONDITIONAL_ELSE)) {
      if (block.includes(TOKEN_CONDITIONAL_BOOLEAN)) {
        const condition = block.split(TOKEN_CONDITIONAL_BOOLEAN)[0];
        if (data[condition]) {
          out += block.substr(condition.length + TOKEN_CONDITIONAL_BOOLEAN.length).trim();
          break blockloop;
        }
      } else {
        out += block;
      }
    }

    out += constant;
  }

  //

  for (const key in data) {
    out = out.split(TOKEN_VARIABLE_OPEN + key + TOKEN_VARIABLE_CLOSE).join(data[key]);
  }

  return out;
}