function createMockFile({ type = "image/png", size = 1024 * 1024, name = "test.png" } = {}) {
  // Create a Uint8Array of the desired size to simulate file content
  const content = new Uint8Array(size);
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

module.exports = {
  createMockFile,
};
