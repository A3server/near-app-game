import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { initContract } from "./utils";
import { BrowserRouter as Router, Routes, Route, useRoutes, Link } from "react-router-dom";

import Mult from "./multiplayer.js";
import Room from "./room.js";

if (module.hot) {
	module.hot.accept(function () {
		location.reload();
	});
}

window.nearInitPromise = initContract()
	.then(() => {
		ReactDOM.render(
			<Router>
				<Routes>
					<Route path="/game" element={<Room />}>
						<Route path="/game/:id" element={<Room />} />
					</Route>
					<Route path="/" element={<App />}>
						<Route path="/:transactionHashes" element={<App />} />
					</Route>
					<Route path="/play" element={<Mult />}>
						<Route path="/play/:transactionHashes" element={<Mult />} />
					</Route>
				</Routes>
			</Router>,
			document.querySelector("#root")
		);
	})
	.catch(console.error);
