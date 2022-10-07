# Kalah
Kalah is a two-player turn-based strategy board game in the mancala family and made for the web browser utilizing `express` and `socket.io`.

# How to play
Both players have 6 small vessels called bins and 1 large vessel called a store. At the beginning of the game all bins are filled with 4 stones each. The south player starts first.

For their move a player selects a non-empty vessel on their side. All stones are removed from that vessel and are placed into vessels one-by-one counter-clockwise starting from the next vessel, but always skipping the opponent's store. This continues until all stones are deposited.

If the last stone is placed into the player's own store, the player gets another turn. If the last stone is placed into the player's own empty bin, that stone and all stones in the adjacent opponent's bin are moved into the player's store - this is called a capture.

The game ends when all bins on any side are empty. The player with more stones on their side wins.
