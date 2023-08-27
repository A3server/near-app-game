import React from "react";
import { Row, Container } from "react-bootstrap";

function Spectators({ playersInRoom, urlPrefix }) {
	return (
		<div className="d-flex flex-column justify-content-center align-items-center mt-3">
			<hr className="mt-1" />
			{/* display in a grid system the objects in the rooms array */}
			<Container className="d-flex flex-wrap justify-content-center">
				{playersInRoom.length === 0 ? (
					<div className="d-flex flex-column">
						<p>No spectators.</p>
					</div>
				) : (
					<Row className="justify-content-center align-items-center ">
						Spectators:{" "}
						{playersInRoom.map((player, index) => {
							return (
								<div
									key={index}
									className="mt-1 col col-sm-10 col-m-5 col-lg-12 col-xl-12"
									style={{
										overflow: "hidden",
										fontSize: "1rem",
										textOverflow: "ellipsis",
									}}
								>
									<a key={index} href={`${urlPrefix}/${player}`} target="_blank">
										{player.length > 30 ? player.substring(0, 25) + "…" : player}
									</a>
								</div>
							);
						})}
					</Row>
				)}
			</Container>
		</div>
	);
}

export default Spectators;
