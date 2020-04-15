

export function hookStd(callback, std) {
  var oldWrite = std.write

  // @ts-ignore
  std.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(std, arguments)
      callback(string, encoding, fd)
    }
  })(std.write)

  return function () {
    std.write = oldWrite
  }
}
