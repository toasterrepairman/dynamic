{
  description = "Deadlock Counter-Build Guide";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
          ];

          shellHook = ''
            echo "Node $(node --version)"
            echo "npm $(npm --version)"
            echo ""
            echo "Run 'npm run deploy' to build and stage the SPA for GitHub Pages."
            echo "Run 'git checkout -- index.html' to restore the dev entrypoint before working."
          '';
        };
      });
}
