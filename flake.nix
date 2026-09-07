{
  description = "NNTU university schedule viewer";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      forAllSystems = nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed;
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nntu-sched = pkgs.runCommand "nntu-sched" { } ''
            mkdir -p $out
            cp ${./index.html} $out/index.html
            cp ${./app.js} $out/app.js
            cp ${./style.css} $out/style.css
            cp ${./modern-normalize.css} $out/modern-normalize.css
            cp ${./sw.js} $out/sw.js
          '';
        in
        {
          nntu-sched = nntu-sched;
          default = nntu-sched;
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.live-server
              pkgs.typescript-go
              pkgs.vscode-langservers-extracted
            ];
            shellHook = ''
              echo "Run: live-server ."
            '';
          };
        }
      );
    };
}
