export const handleQuery = (args: {}): object => {
  let queries = {};

  // * Alternative way with for...in
  // for (const property in args){
  //   const value = args[property]
  //   if(!value) return
  //   queries = { ...queries, [property]: value };
  // }
  Object.entries(args).forEach(([key, value]) => {
    if (!value) return;
    queries = { ...queries, [key]: value };
  });
  if (Object.keys(args).length === 0) {
    return {};
  }
  return queries;
};
