import { Packer } from "./components/Packer";

// Exporting Packer functionality for use as an NPM package.
const  PackageUtil  = {
  createPackages:  Packer.pack
}
  
export default PackageUtil;
