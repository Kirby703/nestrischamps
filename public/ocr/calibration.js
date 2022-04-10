export function flood(img_data, [startX, startY], color = [0, 0, 0]) {
	console.log(startX, startY);
	const seen = new Array(img_data.width)
		.fill()
		.map(_ => new Array(img_data.height).fill());

	function check(x, y) {
		const start_index = 4 * (y * img_data.width + x);
		const data = img_data.data;
		return (
			data[start_index] === color[0] &&
			data[start_index + 1] === color[1] &&
			data[start_index + 2] === color[2]
		);
	}

	function handled(x, y) {
		return seen[x][y] !== undefined;
	}

	if (!check(startX, startY)) {
		throw new Error('Starting point does not match color');
	}

	function maybeAddToQueue(tx, ty) {
		if (!handled(tx, ty)) {
			queue.push([tx, ty]);
		}
	}

	let inspected = 0;
	let x = startX,
		y = startY;
	const queue = [[x, y]];

	while (queue.length) {
		++inspected;
		const [x, y] = queue.shift();
		if (handled(x, y)) continue;

		seen[x][y] = check(x, y);

		if (!seen[x][y]) continue;

		if (x > 0) maybeAddToQueue(x - 1, y);
		if (x < img_data.width - 1) maybeAddToQueue(x + 1, y);
		if (y > 0) maybeAddToQueue(x, y - 1);
		if (y < img_data.height - 1) maybeAddToQueue(x, y + 1);
	}

	return seen;
}

export function getFieldCoordinates(img_data, startPoint, color = [0, 0, 0]) {
	const result = flood(img_data, startPoint, (color = [0, 0, 0]));

	const [top, left, bottom, right] = result.reduce(
		([t, l, b, r], column, x) => {
			column.forEach((isBlack, y) => {
				if (isBlack) {
					if (x < l) l = x;
					if (x > r) r = x;
					if (y < t) t = y;
					if (y > b) b = y;
				}
			});
			return [t, l, b, r];
		},
		[Infinity, Infinity, -1, -1]
	);

	return [left, top, right - left + 1, bottom - top + 1];
}

export function getCaptureCoordinates(
	reference_size,
	reference_location,
	field_w_border_xywh
) {
	const ideal_field_xywh = reference_location.field_w_borders.crop;

	const scaleX = field_w_border_xywh[2] / ideal_field_xywh[2];
	const scaleY = field_w_border_xywh[3] / ideal_field_xywh[3];

	return [
		field_w_border_xywh[0] - ideal_field_xywh[0] * scaleX,
		field_w_border_xywh[1] - ideal_field_xywh[1] * scaleY,
		scaleX * reference_size[0],
		scaleY * reference_size[1],
	];
}
